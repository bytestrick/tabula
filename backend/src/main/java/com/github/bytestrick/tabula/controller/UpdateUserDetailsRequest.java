package com.github.bytestrick.tabula.controller;

import com.github.bytestrick.tabula.controller.dto.UserDetails;
import jakarta.validation.Valid;

public record UpdateUserDetailsRequest(@Valid UserDetails userDetails,
                                       String otp) {
}
