package com.sahil.trading.controller;

import com.sahil.trading.entity.Coin;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.WatchList;
import com.sahil.trading.service.CoinService;
import com.sahil.trading.service.UserService;
import com.sahil.trading.service.WatchListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// WatchListController.java (only relevant methods shown)
@RestController
@RequestMapping("/api/watchlist")
public class WatchListController {
    @Autowired
    private WatchListService watchListService;
    @Autowired
    private UserService userService;
    @Autowired
    private CoinService coinService;

    @GetMapping("/user")
    public ResponseEntity<WatchList> getUserWatchlist(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        WatchList watchList = watchListService.findUserWatchList(user.getId());
        return ResponseEntity.ok(watchList);
    }

    @PatchMapping("/add/coin/{coinId}")
    public ResponseEntity<WatchList> addItemsToWatchlist(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String coinId) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);
        Coin coin = coinService.findById(coinId);
        // change service to return updated WatchList, not just the Coin
        WatchList updated = watchListService.addItemToWatchList(coin, user);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/remove/coin/{coinId}")
    public ResponseEntity<WatchList> removeItemFromWatchlist(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String coinId) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);
        WatchList updated = watchListService.removeItemFromWatchList(coinId, user);
        return ResponseEntity.ok(updated);
    }


    @GetMapping("/{watchlistId}")
    public ResponseEntity<WatchList>  getWatchlist(
            @PathVariable Long watchlistId
    ) throws Exception{
        WatchList watchList = watchListService.findUserWatchList(watchlistId);
        return ResponseEntity.ok(watchList);
    }
}
