package com.sahil.trading.service;

import com.sahil.trading.entity.PaymentDetails;
import com.sahil.trading.entity.User;

public interface PaymentDetailsService {
    public PaymentDetails addPaymentDetails(String accountNumber,
                                            String accountHolderName,
                                            String ifsc,
                                            String bankName,
                                            User user);
    public PaymentDetails getUsersPaymentDetails(User user);
}
