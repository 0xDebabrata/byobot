'use client';

import ProductsService from '@/utils/supabase/services/products';
import ToolCardEffect from '@/components/ui/ToolCardEffect/ToolCardEffect';
import { type ProductType } from '@/type';
// import { shuffleToolsBasedOnDate } from '@/utils/helpers';
import { createBrowserClient } from '@/utils/supabase/browser';
// import CountdownPanel from '@/components/ui/CountdownPanel';

import { useEffect, useState } from 'react';
// import SkeletonToolCard from '@/components/ui/Skeletons/SkeletonToolCard';

export default function Home() {
  const today = new Date();
  const productService = new ProductsService(createBrowserClient());
  const [launchWeeks, setLaunchWeeks] = useState([]);
  const [weeklyWinners, setWeeklyWinners] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // const week = await productService.getWeekNumber(today, 2);
      const weeklyWinners = await productService.getThisWeeksGPTs();
      setWeeklyWinners(weeklyWinners as any);
      setLoading(false);
    };
    fetchData();
  }, []);

  function weekTools(group) {
    return (
      <>
        <div className="mt-3 text-slate-400 text-sm">This week's tools</div>
        <div className="mt-3 text-slate-400 text-sm">
          ❗ Vote for your favorite <b className="text-orange-400">↳</b>
        </div>
        <ul className="mt-3 divide-y divide-slate-800/60">
          {group.products.map((product, idx) => (
            <ToolCardEffect key={idx} tool={product as ProductType} />
          ))}
        </ul>
      </>
    );
  }

  function prevWeekTools(group) {
    return (
      <>
        <div className="mt-3 text-white text-sm">Previous week winners 👑</div>
        <ul className="mt-3 divide-y divide-slate-800/60">
          {group.products.slice(0, 3).map((product, idx) => (
            <ToolCardEffect key={idx} tool={product as ProductType} />
          ))}
        </ul>
      </>
    );
  }

  function weekWinnerTools(products) {
    return (
      <>
        <h2 className='text-base text-slate-900 font-medium'>
          This week's GPTs
        </h2>
        <ul className="mt-3">
          {products.map((product, idx) => (
            <ToolCardEffect key={idx} tool={product as ProductType} />
          ))}
        </ul>
      </>
    );
  }

  return (
    <section className="max-w-4xl mt-5 lg:mt-10 mx-auto px-4 md:px-8">
      <h1 className='text-2xl text-slate-900 font-medium'>
        Trending GPTs
      </h1>
      <div className="mt-10 mb-12">
        {weekWinnerTools(weeklyWinners)}
      </div>
    </section>
  );

  /*
  return (
    <section className="max-w-4xl mt-5 lg:mt-10 mx-auto px-4 md:px-8">
      <CountdownPanel />
      {isLoading ? (
        <div className="mt-14">
          <div>
            <div className="w-24 h-3 rounded-full bg-slate-700 animate-pulse"></div>
            <div className="w-32 h-3 mt-2 rounded-full bg-slate-700 animate-pulse"></div>
          </div>
          <ul className="mt-5 space-y-4">
            {Array(25)
              .fill('')
              .map((item, idx) => (
                <SkeletonToolCard key={idx} />
              ))}
          </ul>
        </div>
      ) : (
        <div className="mt-10 mb-12">
          {launchWeeks.map((group, index) => (index > 0 ? prevWeekTools(group) : weekTools(group)))}
          {weekWinnerTools(weeklyWinners)}
        </div>
      )}
    </section>
  );
  */
}
