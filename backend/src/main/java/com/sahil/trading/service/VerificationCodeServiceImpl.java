package com.sahil.trading.service;

import com.sahil.trading.domain.VerificationType;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.VerificationCode;
import com.sahil.trading.repository.VerificationCodeRepository;
import com.sahil.trading.utils.OtpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class VerificationCodeServiceImpl implements VerificationCodeService {

    @Autowired
    private VerificationCodeRepository verificationCodeRepository;

    @Override
    public VerificationCode sendVerificationCode(User user
                                                 , VerificationType verificationType) {
        VerificationCode verificationCode1 = new VerificationCode();
        verificationCode1.setOtp(OtpUtils.generateOtp());
        verificationCode1.setVerificationType(verificationType);
        verificationCode1.setUser(user);
        return verificationCodeRepository.save(verificationCode1);
    }

    @Override
    public VerificationCode getVerificationCodeById(Long id) throws Exception {
        Optional<VerificationCode> verificationCode = verificationCodeRepository.findById(id);
        if(verificationCode.isPresent()){
            return  verificationCode.get();
        }
        throw new Exception("Verification code not found");
    }

    @Override
    public VerificationCode getVerificationCodeByUser(Long userId) throws Exception {
        return  verificationCodeRepository.findByUserId(userId);
    }

    @Override
    public void deleteVerificationCodebyId(VerificationCode verificationCode) {
        verificationCodeRepository.delete(verificationCode);

    }
}
