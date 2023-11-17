'use client';

import { IconInformationCircle, IconVote } from '@/components/Icons';
import mergeTW from '@/utils/mergeTW';
import { useSupabase } from '@/components/supabase/provider';
import ProductsService from '@/utils/supabase/services/products';
import Modal from '../Modal';
import { createBrowserClient } from '@/utils/supabase/browser';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import customDateFromNow from '@/utils/customDateFromNow';
import LinkItem from '../Link/LinkItem';
import Button from '../Button/Button';
import { createPortal } from 'react-dom';

export default ({
  count,
  launchDate,
  launchEnd,
  productId = null,
  className = '',
}: {
  count?: number;
  launchDate: string | number;
  launchEnd: string | number;
  productId?: number | null;
  className?: string;
}) => {
  const { session } = useSupabase();
  const productsService = new ProductsService(createBrowserClient());

  const router = useRouter();
  const [votesCount, setVotesCount] = useState(count);
  const [isUpvoted, setUpvoted] = useState(false);
  const [isModalActive, setModalActive] = useState(false);
  const [modalInfo, setMoadlInfo] = useState({ title: '', desc: '' });

  const toggleVote = async () => {
    if (session && session.user) {
      const newVotesCount = await productsService.toggleVote(productId as number, session.user.id);
      router.refresh();
      setUpvoted(!isUpvoted);
      setVotesCount(newVotesCount);
    } else router.push('/login');
  };

  useEffect(() => {
    session && session.user
      ? productsService.getUserVoteById(session.user.id, productId as number).then(data => {
          if ((data as { user_id: string })?.user_id) setUpvoted(true);
          else setUpvoted(false);
        })
      : null;
  }, []);

  return (
    <>
      <button
        onClick={toggleVote}
        id="vote-item"
        className={mergeTW(
          `px-4 py-1 text-center text-slate-400 active:scale-[1.5] duration-200 rounded border ${
            isUpvoted ? 'bg-orange-100 text-orange-600 border-orange-600' : 'bg-white border-slate-600 hover:text-orange-400'
          } ${className}`,
        )}
      >
        <IconVote className="mt-1 w-4 h-4 mx-auto pointer-events-none" />
        <span className="text-sm pointer-events-none">{votesCount}</span>
      </button>
      {createPortal(
        <Modal
          isActive={isModalActive}
          icon={<IconInformationCircle className="text-blue-500 w-6 h-6" />}
          title={modalInfo.title}
          description={modalInfo.desc}
          onCancel={() => setModalActive(false)}
        >
          <LinkItem href="/" className="flex-1 block w-full text-sm bg-orange-500 hover:bg-orange-400">
            Explore other tools
          </LinkItem>
          <Button
            onClick={() => setModalActive(false)}
            className="flex-1 block w-full text-sm border border-slate-700 bg-transparent hover:bg-slate-900 mt-2 sm:mt-0"
          >
            Continue
          </Button>
        </Modal>,
        document.body,
      )}
    </>
  );
};
