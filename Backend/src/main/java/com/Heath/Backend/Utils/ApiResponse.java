package com.Heath.Backend.Utils;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<T>("success", message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<T>("error", message, null);
    }
}