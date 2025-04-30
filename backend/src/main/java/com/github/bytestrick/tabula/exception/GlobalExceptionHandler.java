package com.github.bytestrick.tabula.exception;

import com.github.bytestrick.tabula.controller.dto.InformativeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * Bottom of the fall.
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException e) {
        StringBuilder msg = new StringBuilder();
        for (FieldError error : e.getBindingResult().getFieldErrors()) {
            // Avoid leaking sensitive information in the error message
            String val = error.getRejectedValue() != null ? error.getRejectedValue().toString() : "null";
            String fieldName = error.getField().toLowerCase();
            if (fieldName.contains("password") || fieldName.contains("secret") || fieldName.contains("token")) {
                val = "[redacted]";
            }
            msg.append(String.format("'%s' %s, got '%s'.\n", error.getField(), error.getDefaultMessage(), val));
        }
        log.warn("Validation failed, responding with 400: {}", msg);
        return ResponseEntity.badRequest().body(new InformativeResponse(msg.toString()));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<?> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException e) {
        log.warn("Wrong media type, got '{}' instead of '{}'", e.getContentType(), e.getSupportedMediaTypes());
        return ResponseEntity.badRequest().body(new InformativeResponse(e.getMessage()));
    }

    /**
     * Wildcard handler for any unhandled exception.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception e) {
        log.warn("Unhandled exception, responding with 500: {}", e.getMessage());
        return ResponseEntity.internalServerError().body(new InformativeResponse(e.getMessage()));
    }
}
