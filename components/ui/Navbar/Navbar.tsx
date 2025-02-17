'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ButtonMenu from './ButtonMenu';
import Auth from '../Auth';
import { usePathname, useRouter } from 'next/navigation';
import CommandPalette from '../CommandPalette/CommandPalette';
import BlurBackground from '../BlurBackground/BlurBackground';
import AvatarMenu from '../AvatarMenu';
import { useSupabase } from '@/components/supabase/provider';
import { createBrowserClient } from '@/utils/supabase/browser';
import ProductsService from '@/utils/supabase/services/products';
import { type Product } from '@/utils/supabase/types';
import { IconSearch } from '@/components/Icons';

export default () => {
  const [isActive, setActive] = useState(false);
  const [isCommandActive, setCommandActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState<Product[]>([]);

  const browserService = createBrowserClient();
  const toolsService = new ProductsService(browserService);

  const router = useRouter();
  const pathname = usePathname();

  const { supabase, session } = useSupabase();

  const isLoggedin = session?.user;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    router.push('/');
    if (error != null) {
      console.log({ error });
    }
  };

  const navigation = [
    { title: 'About', path: '/about' },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setTimeout(() => {
      toolsService.search(value).then(data => {
        setSearchResult(data as Product[]);
      });
    }, 50);
  };

  useEffect(() => setActive(false), [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-800 w-full">
        <div className="custom-screen items-center py-3 md:flex">
          <div className="flex items-center justify-between md:block">
            <Link href="/">
              <h1 className='text-xl'>
                byo<span className='font-semibold'>bot</span>
              </h1>
            </Link>
            <div className="flex gap-x-4 items-center md:hidden">
              <button aria-label="Search button" onClick={() => setCommandActive(true)} className="text-slate-400 hover:text-slate-200">
                <IconSearch />
              </button>
              <ButtonMenu isActive={isActive} setActive={() => setActive(!isActive)} />
              <div className="md:hidden">
                <AvatarMenu session={session} onLogout={handleLogout} />
              </div>
            </div>
          </div>
          <div className={`flex-1 md:static  ${isActive ? 'w-full fixed top-20 inset-x-0 px-4 md:px-0' : 'hidden md:block'}`}>
            <div className="p-4 px-4 mt-8 text-sm bg-slate-900 rounded-lg md:block md:mt-0 md:p-0 md:bg-transparent">
              <ul className="justify-end items-center space-y-6 text-slate-400 md:flex md:space-x-6 md:space-y-0">
                {navigation.map((item, idx) => {
                  return (
                    <li key={idx} className="hover:text-slate-400 text-slate-700 px-4">
                      <Link href={item.path}>
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
                <Link href="/account/bots/new">
                  <li className='px-3 py-2.5 rounded bg-slate-800 text-white'>
                    Submit a bot
                  </li>
                </Link>
                <li className={`space-y-3 items-center gap-x-6 md:flex md:space-y-0 ${isLoggedin ? 'hidden md:flex' : ''}`}>
                  <Auth onLogout={handleLogout} />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <CommandPalette
        isCommandActive={isCommandActive}
        setCommandActive={() => {
          setCommandActive(false);
          setSearchValue('');
        }}
        searchValue={searchValue}
        setSearch={handleSearch}
        searchResult={searchResult}
      />
      <BlurBackground className="md:hidden z-20" isActive={isActive} setActive={() => setActive(false)} />
    </>
  );
};
