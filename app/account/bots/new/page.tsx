'use client';

import { useSupabase } from '@/components/supabase/provider';
import Button from '@/components/ui/Button/Button';
import CategoryInput from '@/components/ui/CategoryInput';
import { FormLaunchSection, FormLaunchWrapper } from '@/components/ui/FormLaunch';
import { ImageUploaderItem, ImagesUploader } from '@/components/ui/ImagesUploader';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import LabelError from '@/components/ui/LabelError';
import LogoUploader from '@/components/ui/LogoUploader';
import Radio from '@/components/ui/Radio';
import Textarea from '@/components/ui/Textarea';
import createSlug from '@/utils/createSlug';
import { createBrowserClient } from '@/utils/supabase/browser';
import fileUploader from '@/utils/supabase/fileUploader';
import ProductPricingTypesService from '@/utils/supabase/services/pricing-types';
import ProductsService from '@/utils/supabase/services/products';
import { Profile, type ProductCategory, type ProductPricingType } from '@/utils/supabase/types';
import { type File } from 'buffer';
import { type ChangeEvent, useEffect, useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { parse, stringify } from 'yaml';
import SelectLaunchDate from '@/components/ui/SelectLaunchDate';
import axios from 'axios';
import ProfileService from '@/utils/supabase/services/profile';
import { usermaven } from '@/utils/usermaven';
import Alert from '@/components/ui/Alert';
import CodeInput from '@/components/ui/CodeInput';

interface Inputs {
  tool_name: string;
  server_host: string;
  tool_description: string;
  slogan: string;
  pricing_type: number;
  docs: string;
  demo_video: string;
  week: number;
  launch_date: Date;
  launch_start: Date;
  launch_end: Date;
}

export default () => {
  const browserService = createBrowserClient();
  const pricingTypesList = new ProductPricingTypesService(browserService).getAll();
  const productService = new ProductsService(browserService);
  const profileService = new ProfileService(browserService);
  // const productCategoryService = new CategoryService(browserService);

  const router = useRouter();

  const { session } = useSupabase();
  const user = session?.user;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
  } = useForm();

  const [profile, setProfile] = useState<Profile>();

  const [categories, setCategory] = useState<ProductCategory[]>([]);
  const [pricingType, setPricingType] = useState<ProductPricingType[]>([]);

  const [imageFiles, setImageFile] = useState<File[]>([]);
  const [imagePreviews, setImagePreview] = useState<string[]>([]);
  const [imagesError, setImageError] = useState<string>('');

  const [logoFile, setLogoFile] = useState<File | Blob>();
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoError, setLogoError] = useState<string>('');

  const [isLogoLoad, setLogoLoad] = useState<boolean>(false);
  const [isImagesLoad, setImagesLoad] = useState<boolean>(false);
  const [isLaunching, setLaunching] = useState<boolean>(false);

  const [apiType, setApiType] = useState<'yaml' | 'json'>('json');

  useEffect(() => {
    pricingTypesList.then(types => {
      setPricingType([...(types as ProductPricingType[])]);
    });
    profileService.getById(user?.id as string).then(user => {
      setProfile(user as Profile);
    });
  }, []);

  const handleUploadImages = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file && file.type.includes('image') && imagePreviews.length < 5) {
      setImageFile([...(imageFiles as any), file]);
      setImagesLoad(true);
      setImageError('');
      fileUploader({ files: file as Blob, options: 'w=750' }).then(data => {
        if (data?.file) {
          setImagePreview([...imagePreviews, data.file]);
          setImagesLoad(false);
        }
      });
    }
  };

  const handleUploadLogo = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file && file.type.includes('image')) {
      setLogoFile(file);
      setLogoLoad(true);
      fileUploader({ files: file as Blob, options: 'w=128' }).then(data => {
        setLogoPreview(data?.file as string);
        setLogoLoad(false);
      });
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImagePreview(imagePreviews.filter((_, i) => i !== idx));
    setImageFile(imageFiles.filter((_, i) => i !== idx));
  };

  const validateImages = () => {
    setImageError('');
    setLogoError('');
    // if (imageFiles.length === 0) setImageError('Please choose some screenshots');
    if (!logoFile) setLogoError('Please choose product logo');
    else return true;
  };

  const validateToolName = async () => {
    const tool = await productService.getBySlug(createSlug(getValues('tool_name')));
    if (tool?.slug) {
      alert('This tool name is already exist, please use another name for your tool.');
      return false;
    } else return true;
  };

  const addServersKey = (api: string, apiType: 'yaml' | 'json', host: string) => {
    if (apiType === 'json') {
      const jsonSpec = JSON.parse(api);
      if (!jsonSpec.servers) {
        // Add servers field
        jsonSpec.servers = [
          {
            url: host
          }
        ];
      }
      return JSON.stringify(jsonSpec);
    } else {
      const yamlSpec = parse(api);
      if (!yamlSpec.servers) {
        // Add servers field
        yamlSpec.servers = [
          {
            url: host
          }
        ];
      }
      return stringify(yamlSpec);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async data => {
    if (validateImages() && (await validateToolName())) {
      const { tool_name, server_host, slogan, docs, week, spec } = data;
      const categoryIds = categories.map(item => item.id);
      setLaunching(true);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // const weeks = await productService.getWeeks(new Date().getFullYear(), 2);
      // const weekData = weeks.find(i => i.week === parseInt(week));
      //
      const hostWithoutEndingForwardSlash = server_host.endsWith('/')
        ? server_host.substring(0, server_host.length - 1)
        : server_host;

      await productService
        .insert(
          {
            asset_urls: imagePreviews,
            name: tool_name,
            demo_url: hostWithoutEndingForwardSlash,
            github_url: docs,
            pricing_type: 1,
            slogan,
            description: slogan,
            logo_url: logoPreview,
            owner_id: user?.id,
            slug: createSlug(tool_name),
            is_draft: false,
            comments_count: 0,
            votes_count: 0,
            // demo_video_url: demo_video,
            launch_date: tomorrow.toISOString(),
            launch_start: tomorrow.toISOString(),
            launch_end: tomorrow.toISOString(),
            // week: parseInt(week),
            api_spec: addServersKey(spec, apiType, hostWithoutEndingForwardSlash),
            api_type: apiType,
          },
          categoryIds,
        )
        .then(async res => {
          setLaunching(false);
          localStorage.setItem(
            'last-tool',
            JSON.stringify({
              toolSlug: res?.slug,
              launchDate: res?.launch_date,
              launchEnd: res?.launch_end,
            }),
          );
          // window.open(`/tool/${res?.slug}?banner=true`);
          router.push('/');
        });
    }
  };

  return (
    <section className="container-custom-screen">
      {/* <Alert context="Any non-dev tools will be subject to removal. Please ensure that your submission is relevant to the developer community." /> */}
      <h1 className="text-xl text-slate-800 font-semibold mt-6">Submit a bot</h1>
      <div className="mt-12">
        <FormLaunchWrapper onSubmit={handleSubmit(onSubmit as () => void)}>
          <FormLaunchSection
            title="Tell us about your bot"
            description=""
          >
            <div>
              <LogoUploader isLoad={isLogoLoad} required src={logoPreview} onChange={handleUploadLogo} />
              <LabelError className="mt-2">{logoError}</LabelError>
            </div>
            <div>
              <Label>Name</Label>
              <Input
                placeholder="ChatGPT"
                className="w-full mt-2"
                validate={{ ...register('tool_name', { required: true, minLength: 3 }) }}
              />
              <LabelError className="mt-2">{errors.tool_name && 'Please enter a name.'}</LabelError>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                placeholder="Ask questions. Get help. 10x your productivity."
                className="w-full mt-2"
                validate={{ ...register('slogan', { required: true, minLength: 10 }) }}
              />
              <LabelError className="mt-2">{errors.slogan && 'Please enter a description.'}</LabelError>
            </div>
            <div>
              <Label>Server URL</Label>
              <Input
                placeholder="https://api.example.com"
                className="w-full mt-2"
                validate={{
                  ...register('server_host', { required: true, pattern: /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)*$/i }),
                }}
              />
              <LabelError className="mt-2">{errors.server_host && 'Please enter a URL'}</LabelError>
            </div>
            <div>
              <Label>API Specification</Label>
              <CodeInput
                className="text-sm w-full mt-2 rounded border border-slate-600 p-2 bg-slate-800/10 hover:bg-white focus:outline-none focus:bg-white duration-150"
                validate={{
                  ...register('spec', { required: true }),
                }}
              />
              <LabelError className="mt-2">{errors.spec && 'Please enter an API spec'}</LabelError>
              <div className='flex space-x-4'>
                {['json', 'yaml'].map((type, idx) => (
                  <div
                    key={idx}
                    className={`${apiType === type ? 'bg-orange-400 text-white' : 'border border-slate-600'} text-sm py-1 px-1.5 rounded cursor-pointer`}
                    onClick={() => { setApiType(type as 'json' | 'yaml'); }}
                  >
                    {type.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Documentation URL (optional)</Label>
              <Input
                placeholder="https://example.com/docs"
                className="w-full mt-2"
                validate={{
                  ...register('docs', { required: false, pattern: /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)*$/i }),
                }}
              />
              <LabelError className="mt-2">{errors.github_repo && 'Please enter a valid github repo url'}</LabelError>
            </div>
            <Button type="submit" isLoad={isLaunching} className="w-full hover:bg-orange-400 ring-offset-2 ring-orange-500 focus:ring">
              Submit
            </Button>
            {/*
            <div>
              <Label>Quick Description (max 300 characters)</Label>
              <Textarea
                placeholder="Briefly explain what your tool does. HTML is supported"
                className="w-full h-36 mt-2"
                validate={{
                  ...register('tool_description', { required: true, maxLength: 350 }),
                }}
              />
              <LabelError className="mt-2">{errors.tool_description && 'Please enter your tool description'}</LabelError>
            </div>
            */}
          </FormLaunchSection>
          {/*
          <FormLaunchSection
            number={2}
            title="Extra Stuff"
            description="We'll use this to group your tool with others and share it in newsletters. Plus, users can filter by price and categories!"
          >
            <div>
              <Label>Tool pricing type</Label>
              {pricingType.map((item, idx) => (
                <Controller
                  key={idx}
                  name="pricing_type"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <div className="mt-2 flex items-center gap-x-2">
                      <Radio value="free" onChange={e => field.onChange(item.id)} id={item.title as string} name="pricing-type" />
                      <Label htmlFor={item.title as string} className="font-normal">
                        {item.title}
                      </Label>
                    </div>
                  )}
                />
              ))}
              <LabelError className="mt-2">{errors.pricing_type && 'Please select your tool pricing type'}</LabelError>
            </div>
            <div>
              <Label>Tool categories (optional)</Label>
              <CategoryInput className="mt-2" categories={categories} setCategory={setCategory} />
            </div>
          </FormLaunchSection>
          <FormLaunchSection number={3} title="Media" description="Show off how awesome your dev tool is with cool images.">
            <div>
              <Label>Demo video (optional)</Label>
              <Input
                placeholder="Demo video (optional). YouTube or mp4 link"
                className="w-full mt-2"
                validate={{
                  ...register('demo_video', { required: false, pattern: /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)*$/i }),
                }}
              />
              <LabelError className="mt-2">{errors.demo_video && 'Please enter a valid demo video url'}</LabelError>
            </div>
            <div>
              <Label>Tool screenshots</Label>
              <p className="text-sm text-slate-400">
                Upload at least three screenshots showcasing different aspects of functionality. Note that the first image will be used as
                social preview, so choose wisely!
              </p>
              <ImagesUploader isLoad={isImagesLoad} className="mt-4" files={imageFiles as []} max={5} onChange={handleUploadImages}>
                {imagePreviews.map((src, idx) => (
                  <ImageUploaderItem
                    src={src}
                    key={idx}
                    onRemove={() => {
                      handleRemoveImage(idx);
                    }}
                  />
                ))}
              </ImagesUploader>
              <LabelError className="mt-2">{imagesError}</LabelError>
            </div>
          </FormLaunchSection>
          <FormLaunchSection
            title="Launch Week for Your Dev Tool"
            description="Setting the perfect launch week is essential to make a splash in the dev world."
          >
            <div>
              <ul className="text-sm text-slate-400">
                <li className="text-slate-300 mb-1">By choosing your tool's big day, you're guaranteeing:</li>
                <li>
                  <b>1. Home Page Spotlight:</b> Your tool will steal the show on our home page for a full 24 hours!
                </li>
                <li>
                  <b>2. Morning Buzz:</b> We'll shoot out an email featuring your tool to our subscribers that very morning.
                </li>
                <li>
                  <b>3. Daily Voting Frenzy:</b> Users will be eager to check out and vote for all of the day's featured tools.
                </li>
              </ul>
              <div className="relative mt-4 mb-3">
                <SelectLaunchDate
                  label="Launch week"
                  className="w-full"
                  validate={{
                    ...register('week', { required: true }),
                  }}
                />
                <LabelError className="mt-2">{errors.weel && 'Please pick a launch week'}</LabelError>
              </div>
            </div>
            <div className="pt-7">
              <p className="text-sm text-slate-500 mt-2">* no worries, you can change it later</p>
            </div>
          </FormLaunchSection>
          */}
        </FormLaunchWrapper>
      </div>
    </section>
  );
};
