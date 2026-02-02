package com.sahil.trading.service;

import com.sahil.trading.entity.Coin;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.WatchList;
import com.sahil.trading.repository.WatchListRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class WatchListServiceImpl implements WatchListService {

    @Autowired
    private WatchListRepository watchListRepository;

    @Override
    public WatchList findUserWatchList(Long userId) throws Exception {
        WatchList watchList = watchListRepository.findByUserId(userId);
        if (watchList == null) {
            // create a new (empty) watchlist for user if not found
            watchList = new WatchList();
            // NOTE: prefer setting actual User in callers that have it.
            watchList.setCoins(new ArrayList<>());
            watchList = watchListRepository.save(watchList);
        }
        return watchList;
    }

    @Override
    public WatchList createWatchList(User user) {
        WatchList watchList = new WatchList();
        watchList.setUser(user);
        if (watchList.getCoins() == null) watchList.setCoins(new ArrayList<>());
        return watchListRepository.save(watchList);
    }

    @Override
    public WatchList findById(Long id) throws Exception {
        Optional<WatchList> watchList = watchListRepository.findById(id);
        if (watchList.isEmpty()) {
            throw new Exception("Watchlist not found");
        }
        return watchList.get();
    }

    /**
     * Toggle coin presence in user's watchlist: if present -> remove, otherwise -> add.
     * Returns the updated WatchList (with coins list).
     */
    @Override
    @Transactional
    public WatchList addItemToWatchList(Coin coin, User user) throws Exception {
        if (coin == null) throw new Exception("Coin is required");
        if (user == null) throw new Exception("User is required");

        WatchList watchList = watchListRepository.findByUserId(user.getId());
        if (watchList == null) {
            watchList = new WatchList();
            watchList.setUser(user);
            watchList.setCoins(new ArrayList<>());
        }

        List<Coin> coins = watchList.getCoins();
        if (coins == null) {
            coins = new ArrayList<>();
            watchList.setCoins(coins);
        }

        boolean exists = coins.stream().anyMatch(c -> c.getId().equals(coin.getId()));
        if (exists) {
            coins.removeIf(c -> c.getId().equals(coin.getId()));
        } else {
            coins.add(coin);
        }

        watchList.setCoins(coins);
        watchList = watchListRepository.save(watchList);
        return watchList;
    }

    /**
     * Remove coin from watchlist by coinId. Returns updated watchlist.
     */
    @Override
    @Transactional
    public WatchList removeItemFromWatchList(String coinId, User user) throws Exception {
        if (coinId == null) throw new Exception("coinId required");
        if (user == null) throw new Exception("User is required");

        WatchList wl = watchListRepository.findByUserId(user.getId());
        if (wl == null) {
            wl = new WatchList();
            wl.setUser(user);
            wl.setCoins(new ArrayList<>());
            wl = watchListRepository.save(wl);
            return wl;
        }

        List<Coin> coins = wl.getCoins();
        if (coins == null || coins.isEmpty()) {
            return wl;
        }

        boolean removed = coins.removeIf(c -> c.getId().equals(coinId));
        if (removed) {
            wl.setCoins(coins);
            wl = watchListRepository.save(wl);
        }
        return wl;
    }
}
