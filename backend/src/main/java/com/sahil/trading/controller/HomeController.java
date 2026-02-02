package com.sahil.trading.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class HomeController {
    @GetMapping
    public String hom(){
        return "Welcome to Trading Platform";
    }
}
