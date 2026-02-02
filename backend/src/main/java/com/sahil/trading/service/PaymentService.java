package com.sahil.trading.service;

import com.razorpay.RazorpayException;
import com.sahil.trading.domain.PaymentMethod;
import com.sahil.trading.entity.PaymentOrder;
import com.sahil.trading.entity.User;
import com.sahil.trading.response.PaymentResponse;
import com.stripe.exception.StripeException;

public interface PaymentService {

    PaymentOrder createOrder(User user, Long Amount , PaymentMethod paymentMethod);

    PaymentOrder getOrderPaymentById(Long id) throws Exception;
    Boolean proceedPaymentOrder(PaymentOrder paymentOrder, String paymentId) throws RazorpayException;
    PaymentResponse createRazorpayPaymentLink(User user, Long amount, Long orderId) throws RazorpayException;
    PaymentResponse createStripePaymentLink(User user, Long amount, Long orderId) throws StripeException;

}
