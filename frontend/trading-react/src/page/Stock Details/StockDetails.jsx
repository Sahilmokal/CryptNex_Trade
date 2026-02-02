import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BookmarkFilledIcon, BookmarkIcon, DotIcon } from '@radix-ui/react-icons';
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TradingForm from './TradingForm';
import StockChart from '../Home/StockChart';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchCoinDetails } from '@/State/Coin/Action';
import { addItemToWatchlist } from '@/State/Watchlist/Action';

const fmt = (n) => {
  if (n == null || Number.isNaN(Number(n))) return '-';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(n));
};

const StockDetails = () => {
  const coinState = useSelector((state) => state.coin || {});
  const { coinDetails: details, loading, error } = coinState;
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;
    dispatch(fetchCoinDetails({ coinId: id, jwt: localStorage.getItem("jwt") }));
  }, [dispatch, id]);

  const handleAddToWatchlist = async () => {
  try {
    const coinId = details?.id ?? details?.coinId ?? details?.symbol;
    const jwt = localStorage.getItem("jwt");
    console.log("Add to watchlist call:", { coinId, jwt });

    if (!coinId) {
      console.warn("No coinId available on details:", details);
      return;
    }

    // dispatch add and wait for the result
    const res = await dispatch(addItemToWatchlist({ coinId, jwt }));
    console.log("addItemToWatchlist result:", res);

    
  } catch (err) {
    console.error("Failed to add to watchlist:", err?.response?.data ?? err?.message ?? err);
  }
};


  if (loading) return <div className="p-10">Loading coin details...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {String(error)}</div>;
  if (!details) return <div className="p-10">No coin details available.</div>;

  const symbol = (details.symbol || '').toUpperCase() || '-';
  const name = details.name || '-';
  const price = details?.market_data?.current_price?.usd ?? null;
  const changePct = details?.market_data?.market_cap_change_percentage_24h ?? null;
  // if you prefer absolute market cap change (not percentage) use another field; adjust as needed

  return (
    <div className='p-10 mt-5'>
      <div className='flex justify-between'>
        <div className='flex gap-5 items-center'>
          <div>
            <Avatar>
              {details?.image?.large ? (
                <AvatarImage src={details.image.large} alt={name} />
              ) : (
                <AvatarFallback>{(name || '?').charAt(0)}</AvatarFallback>
              )}
            </Avatar>
          </div>

          <div>
            <div className='flex items-center gap-2'>
              <p>{symbol}</p>
              <DotIcon className='text-gray-400' />
              <p className='text-gray-400'>{name}</p>
            </div>

            <div className='flex items-end gap-2'>
              <p className='text-xl font-bold'>${fmt(price)}</p>
              <p className={changePct != null && changePct >= 0 ? 'text-green-500' : 'text-red-500'}>
                {changePct != null ? `${fmt(changePct)}%` : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          <Button onClick={handleAddToWatchlist}>
            {true ? <BookmarkFilledIcon className='h-6 w-6' /> :
              <BookmarkIcon className='h-6 w-6' />}
          </Button>

          <Dialog>
            {/* use asChild so Radix won't render another <button> */}
            <DialogTrigger asChild>
              <Button size="lg">Trade</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>How Much Do you want to spend?</DialogTitle>
              </DialogHeader>
              <TradingForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className='mt-10'>
        <StockChart coinId={id}/>
      </div>
    </div>
  );
};

export default StockDetails;
