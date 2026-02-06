import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Lock, User, Phone, Shield, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import logo from "@/assets/rbp-finivis-logo.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const { user, loading: authLoading, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (!error) {
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse({
      fullName: signupName,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupPhone || undefined);
    setIsLoading(false);

    if (!error) {
      navigate("/dashboard");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!resetEmail || !z.string().email().safeParse(resetEmail).success) {
      setErrors({ resetEmail: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(resetEmail);
    setIsLoading(false);

    if (!error) {
      setResetSent(true);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Login / Sign Up - RBP FINIVIS</title>
        <meta name="description" content="Sign in to your RBP FINIVIS account or create a new one. Access international remittance, currency exchange, forex cards, and more." />
      </Helmet>
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center justify-center mb-8">
            <img src={logo} alt="RBP FINIVIS" className="h-24 w-auto brightness-0 invert" />
          </Link>
          
          <Card className="shadow-xl">
            {showForgotPassword ? (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="font-heading text-2xl">
                    {resetSent ? "Check Your Email" : "Reset Password"}
                  </CardTitle>
                  <CardDescription>
                    {resetSent 
                      ? "We've sent a password reset link to your email"
                      : "Enter your email to receive a reset link"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resetSent ? (
                    <div className="space-y-4 text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                      <p className="text-muted-foreground">
                        Please check your inbox and click the reset link to set a new password.
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetSent(false);
                          setResetEmail("");
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div>
                        <Label>Email</Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="you@email.com" 
                            className="pl-10"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                          />
                        </div>
                        {errors.resetEmail && <p className="text-sm text-destructive mt-1">{errors.resetEmail}</p>}
                      </div>
                      <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Send Reset Link <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button 
                        type="button"
                        variant="ghost" 
                        className="w-full"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setErrors({});
                        }}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                      </Button>
                    </form>
                  )}
                </CardContent>
              </>
            ) : (
              <>
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-2xl">Welcome</CardTitle>
              <CardDescription>Sign in to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="email" 
                          placeholder="you@email.com" 
                          className="pl-10"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label>Password</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                      </div>
                      {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                    </div>
                    <div className="text-right">
                      <button 
                        type="button" 
                        className="text-sm text-accent hover:underline"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Sign In <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <div className="relative mt-2">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="John Doe" 
                          className="pl-10"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                        />
                      </div>
                      {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                    </div>
                    <div>
                      <Label>Email</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="email" 
                          placeholder="you@email.com" 
                          className="pl-10"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label>Phone Number (Optional)</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="+91 XXXXX XXXXX" 
                          className="pl-10"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Password</Label>
                      <div className="relative mt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                        />
                      </div>
                      {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                    </div>
                    <Button type="submit" variant="cta" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Account <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our{" "}
                      <Link to="/terms" className="text-accent hover:underline">Terms</Link> and{" "}
                      <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
              </>
            )}
          </Card>

          <div className="mt-6 flex items-center justify-center gap-2 text-primary-foreground/70 text-sm">
            <Shield className="h-4 w-4" />
            <span>RBI Licensed FFMC | 256-bit SSL Secured</span>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Auth;
