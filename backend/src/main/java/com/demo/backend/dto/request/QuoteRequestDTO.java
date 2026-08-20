package com.demo.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteRequestDTO {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không được quá 100 ký tự")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20, message = "Số điện thoại không được quá 20 ký tự")
    private String phone;

    @Size(max = 100, message = "Email không được quá 100 ký tự")
    private String email;

    @Size(max = 50, message = "Dịch vụ không được quá 50 ký tự")
    private String service;

    @Size(max = 2000, message = "Mô tả không được quá 2000 ký tự")
    private String message;
}
