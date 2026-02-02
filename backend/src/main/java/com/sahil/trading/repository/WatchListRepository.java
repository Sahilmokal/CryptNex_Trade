package com.sahil.trading.repository;

import com.sahil.trading.entity.WatchList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchListRepository extends JpaRepository<WatchList, Long> {
    WatchList findByUserId(Long userId);
    void deleteByUserId(Long userId);

}
