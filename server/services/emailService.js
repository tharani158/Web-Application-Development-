const sendResetEmail = async (email, resetUrl) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Password reset email delivery is not configured');
  }
  // Development-only delivery: keep the reset URL out of API responses.
  console.log(`Development password reset link for ${email}: ${resetUrl}`);
};

module.exports = { sendResetEmail };
