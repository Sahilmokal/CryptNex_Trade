package com.sahil.trading.controller;


import com.sahil.trading.domain.OrderType;
import com.sahil.trading.entity.Coin;
import com.sahil.trading.entity.Order;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.WalletTransaction;
import com.sahil.trading.request.CreateOrderRequest;
import com.sahil.trading.service.CoinService;
import com.sahil.trading.service.OrderService;
import com.sahil.trading.service.UserService;
import com.sahil.trading.service.WalletService;
import org.aspectj.weaver.ast.Or;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.json.WritableJson;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private CoinService coinService;


    @Autowired
    private WalletService walletService;

    @PostMapping("/pay")
    public ResponseEntity<Order> payOrderPayment(@RequestHeader("Authorization") String jwt,
                                                 @RequestBody CreateOrderRequest req) throws Exception{
        User user = userService.findUserProfileByJwt(jwt);
        Coin coin = coinService.findById(req.getCoinId());
        Order order = orderService.processOrder(coin, req.getQuantity(), req.getOrderType(), user);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@RequestHeader("Authorization") String jwtToken,
                                              @PathVariable Long orderId) throws Exception{

        User user = userService.findUserProfileByJwt(jwtToken);
        Order order = orderService.getOrderById(orderId);
        if(order.getUser().getId().equals(user.getId())){
            return ResponseEntity.ok(order);
        }
        else{
            throw  new Exception("you don't have access");
        }
    }

    @GetMapping
    public  ResponseEntity<List<Order>> getAllOrdersForUser(
            @RequestHeader("Authorization") String jwtToken,
            @RequestParam(required = false) OrderType order_type,
            @RequestParam(required = false) String asset_symbol
    ) throws Exception{
        Long userId= userService.findUserProfileByJwt(jwtToken).getId();
        List<Order> userOrders = orderService.getAllOrdersOfUser(userId, order_type,asset_symbol);
        return  ResponseEntity.ok(userOrders);


    }
    @GetMapping("/api/wallet/transactions")
    public ResponseEntity<List<WalletTransaction>> getWalletTransactions(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "50") int size
    ) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);
        List<WalletTransaction> transactions = walletService.getWalletTransactions(user, page, size);

        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

}
