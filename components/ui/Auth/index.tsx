'use client';

import { useSupabase } from '@/components/supabase/provider';
import { useCallback, useEffect, useState } from 'react';
import AvatarMenu from '../AvatarMenu';
import axios from 'axios';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
// import Brand from '@/components/ui/Brand';
import { GithubProvider, GoogleProvider } from '../AuthProviderButtons';
import ProfileService from '@/utils/supabase/services/profile';
import { createBrowserClient } from '@/utils/supabase/browser';
import { useRouter } from 'next/navigation';
import { getURL } from '@/components/ui/LoginPage';
// Supabase auth needs to be triggered client-side

export default function Auth({ onLogout }: { onLogout?: () => Promise<void> }) {
  const { supabase, session, user } = useSupabase();
  const [isGoogleAuthLoad, setGoogleAuthLoad] = useState<boolean>(false);
  const [isGithubAuthLoad, setGithubAuthLoad] = useState<boolean>(false);
  const [isModalActive, setModalActive] = useState<boolean>(false);

  const router = useRouter();

  const profile = new ProfileService(createBrowserClient());

  const handleGoogleLogin = async () => {
    setGoogleAuthLoad(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getURL()
      }
    });
    if (error != null) {
      console.log({ error });
    }
    setGoogleAuthLoad(false);
    setModalActive(false);
  };

  const handleGitHubLogin = async () => {
    setGithubAuthLoad(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: getURL()
      }
    });

    if (error != null) {
      console.log({ error });
    }
    setGithubAuthLoad(false);
    setModalActive(false);
  };

  const HandleSignInNotification = useCallback(() => {
    const eventListener = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        profile.getById(session.user.id).then(async user => {
          if (!user?.updated_at) {
            const DISCORD_USER_WEBHOOK = process.env.DISCORD_USER_WEBHOOK as string;
            const content = `**${user?.full_name}** [open the profile](https://devhunt.org/@${user?.username})`;
            if (DISCORD_USER_WEBHOOK) await axios.post(DISCORD_USER_WEBHOOK, { content });

            await axios.post('/api/login', { firstName: user?.full_name as string, personalEMail: session.user.email as string });
            await profile.update(user?.id as string, {
              updated_at: new Date().toISOString(),
            });
          }
        }).catch(console.error);
        eventListener.data.subscription.unsubscribe();
      }
    });
  }, []);

  useEffect(() => {
    HandleSignInNotification();
  }, []);

  // console.log(session && session.user)

  // this `session` is from the root loader - server-side
  // therefore, it can safely be used to conditionally render
  // SSR pages without issues with hydration

  return Boolean(session) ? (
    <div className="hidden md:block">
      <AvatarMenu session={session} onLogout={onLogout} />
    </div>
  ) : (
    <div className="flex items-center">
      <Button variant="shiny" onClick={() => setModalActive(true)}>
        Sign In
      </Button>
      <Modal variant="custom" isActive={isModalActive} onCancel={() => setModalActive(false)} className="max-w-md">
        <div className="text-center p-2">
          <div className="">
            {/* <Brand w="130" h="40" className="mx-auto" /> */}
            <h1 className='text-xl text-black'>
              byo<span className='font-semibold'>bot</span>
            </h1>
            <h1 className="text-slate-600 text-lg">Log in to your account</h1>
          </div>
          <GithubProvider isLoad={isGithubAuthLoad} onClick={handleGitHubLogin} className="w-full justify-center mt-4" />
          {/* <GoogleProvider isLoad={isGoogleAuthLoad} onClick={handleGoogleLogin} className="w-full justify-center mt-2" /> */}
        </div>
      </Modal>
    </div>
  );
}
