interface ErrorDetails {
  code: string;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}

class ErrorReporter {
  private errors: ErrorDetails[] = [];
  private maxErrors = 100;

  report(error: Error, context?: Record<string, any>) {
    const errorDetails: ErrorDetails = {
      code: this.getErrorCode(error),
      message: error.message,
      timestamp: Date.now(),
      context
    };

    this.errors.push(errorDetails);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Image Error:', errorDetails);
    }

    // Could send to error tracking service here
  }

  private getErrorCode(error: Error): string {
    if (error instanceof TypeError) return 'TYPE_ERROR';
    if (error.name === 'NetworkError') return 'NETWORK_ERROR';
    if (error.message.includes('timeout')) return 'TIMEOUT_ERROR';
    return 'UNKNOWN_ERROR';
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorReporter = new ErrorReporter(); 