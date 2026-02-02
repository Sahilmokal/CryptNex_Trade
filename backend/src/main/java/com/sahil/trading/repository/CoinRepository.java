package com.sahil.trading.repository;

import com.sahil.trading.entity.Coin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CoinRepository extends JpaRepository<Coin, String> {


}
