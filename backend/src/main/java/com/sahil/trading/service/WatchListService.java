package com.sahil.trading.service;

import com.sahil.trading.entity.Coin;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.WatchList;

public interface WatchListService {

    WatchList findUserWatchList(Long userId) throws Exception;
    WatchList createWatchList(User user);
    WatchList findById(Long id) throws Exception;
    WatchList addItemToWatchList(Coin coin , User user) throws Exception;
    WatchList removeItemFromWatchList(String coinId, User user) throws Exception;
}
