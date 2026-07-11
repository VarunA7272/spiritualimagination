import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthOtpService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Requests a new 6-digit OTP for the given mobile number.
   * Rate limits to max 3 requests per 10 minutes.
   */
  async requestOtp(mobile: string): Promise<{ success: boolean; message: string; mockOtp?: string }> {
    try {
      const formattedMobile = this.formatMobile(mobile);
      const otpCode = await this.supabaseService.requestOtpRpc(formattedMobile);
      
      // In our design, the SQL database returns the OTP code for development/mock testing.
      // We will print it in the console so developers/reviewers can test without real SMS charges.
      if (otpCode) {
        console.log(`[SI AUTH OTP] Generated OTP for ${formattedMobile}: ${otpCode}`);
        return { 
          success: true, 
          message: 'OTP sent successfully! Check console for mock code.', 
          mockOtp: otpCode 
        };
      }
      
      return { 
        success: true, 
        message: 'OTP has been sent to your mobile number.' 
      };
    } catch (err: any) {
      console.error('OTP request error:', err);
      return { 
        success: false, 
        message: err.message || 'Failed to request OTP. Please try again later.' 
      };
    }
  }

  /**
   * Verifies the OTP code submitted by the user.
   */
  async verifyOtp(mobile: string, code: string): Promise<boolean> {
    try {
      const formattedMobile = this.formatMobile(mobile);
      return await this.supabaseService.verifyOtpRpc(formattedMobile, code);
    } catch (err) {
      console.error('OTP verification error:', err);
      return false;
    }
  }

  /**
   * Cleans mobile number input (e.g. +91 93005-45485 -> 919209636699)
   */
  private formatMobile(mobile: string): string {
    if (!mobile) return '';
    // Strip non-digits
    let digits = mobile.replace(/\D/g, '');
    // If it's a 10-digit Indian number without country code, prefix with 91
    if (digits.length === 10) {
      digits = '91' + digits;
    }
    return digits;
  }
}
