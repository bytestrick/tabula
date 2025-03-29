package com.github.bytestrick.tabula.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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
        return ResponseEntity.badRequest().body(msg);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<?> handleNoResourceFoundException(NoResourceFoundException e, WebRequest request) {
        log.warn("{} not found, responding with 404: {}", request.getContextPath(), e.getMessage());
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("Bad request, responding with 400: {}", e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    /**
     * Wildcard handler for any unhandled exception.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception e) {
        log.warn("Unhandled exception, responding with 500: {}", e.getMessage());
        return ResponseEntity.internalServerError().body(e.getMessage());
    }
}
