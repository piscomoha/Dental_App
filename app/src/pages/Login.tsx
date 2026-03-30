import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, EyeOff } from 'lucide-react';
import { demoUsers } from '@/data/mockData';
import LoginTransitionScreen from '@/components/LoginTransitionScreen';
import { passwordResetApi, authApi } from '@/services/api';

interface LoginProps {
  onLogin: (user: { name: string; role: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'password'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regMessage, setRegMessage] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  
  // Transition state
  const [transitioningUser, setTransitioningUser] = useState<{ name: string; role: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    
    if (!email || !password) {
      alert('Veuillez entrer votre email et mot de passe');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);
      
      // Successfully logged in with database credentials
      setTransitioningUser({
        name: response.user.name,
        role: response.user.role,
      });
    } catch (error) {
      // Fallback to demo users for testing
      const user = demoUsers.find(u => u.email === email);
      if (user) {
        setTransitioningUser({ name: user.name, role: user.role });
      } else {
        alert('Email ou mot de passe incorrect. Essayez: doctor@dental.ma ou les comptes de démonstration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegMessage('');

    // Validation
    if (!regFullName || !regEmail || !regPassword || !regConfirmPassword) {
      setRegError('Veuillez remplir tous les champs');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Le mot de passe doit avoir au moins 8 caractères');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Les mots de passe ne correspondent pas');
      return;
    }

    // Validate email domain
    const isDoctor = regEmail.endsWith('@doctor.ma');
    const isSecretary = regEmail.endsWith('@secretariat.ma');
    const isPatient = !isDoctor && !isSecretary;

    if (!isDoctor && !isSecretary && !isPatient) {
      if (!regEmail.includes('@')) {
        setRegError('Veuillez entrer une adresse email valide');
        return;
      }
    }

    try {
      setIsLoading(true);
      const response = await authApi.register(regFullName, regEmail, regPassword, regConfirmPassword);
      
      setRegMessage('✓ Inscription réussie! Identifiants sauvegardés. Redirection vers connexion...');
      setRegError('');

      // Clear registration form
      setRegFullName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        setEmail(response.user.email);
        setPassword('');
        setActiveTab('login');
        setRegMessage('');
      }, 2000);
    } catch (error) {
      setRegError(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoUser: typeof demoUsers[0]) => {
    setTransitioningUser({ name: demoUser.name, role: demoUser.role });
  };

  const completeLogin = () => {
    if (transitioningUser) {
      onLogin(transitioningUser);
    }
  };

  // Forgot Password Handlers
  const handleForgotPasswordSubmit = async () => {
    if (!forgotEmail) {
      setResetError('Veuillez entrer votre email');
      return;
    }
    
    try {
      setIsLoading(true);
      setResetError('');
      await passwordResetApi.sendResetLink(forgotEmail);
      setResetMessage('Un code de vérification a été envoyé à votre email');
      setResetStep('code');
      setTimeout(() => setResetMessage(''), 3000);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCodeSubmit = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setResetError('Veuillez entrer un code de vérification valide');
      return;
    }
    
    try {
      setIsLoading(true);
      setResetError('');
      await passwordResetApi.verifyToken(forgotEmail, verificationCode);
      setResetToken(verificationCode);
      setResetMessage('Code vérifié avec succès');
      setResetStep('password');
      setTimeout(() => setResetMessage(''), 2000);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Code invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setResetError('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword.length < 8) {
      setResetError('Le mot de passe doit avoir au moins 8 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      setIsLoading(true);
      setResetError('');
      await passwordResetApi.resetPassword(forgotEmail, resetToken, newPassword, confirmPassword);
      setResetMessage('Votre mot de passe a été réinitialisé avec succès');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetStep('email');
        setForgotEmail('');
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
        setResetMessage('');
        setResetToken('');
      }, 2000);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>

      {transitioningUser && (
        <LoginTransitionScreen 
          userName={transitioningUser.name} 
          role={transitioningUser.role} 
          onComplete={completeLogin} 
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-[#0d3d3d] via-[#1a5a5a] to-[#1a7a7a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#c4a35a] rounded-xl flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
              <path d="M12 2C8.5 2 6 4.5 6 7c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-1.5 1-2.5 2-2.5s2 1 2 2.5c0 1.5.5 2.5 1 3.5.5 1 1 2 1 3.5 0 2.5-1 4-1 5.5 0 1.5.5 2.5 2 2.5s2-1 2-2.5c0-1.5 1-3 1-5.5 0-1.5-.5-2.5-1-3.5-.5-1-1-2-1-3.5 0-2.5-2.5-5-6-5z" />
            </svg>
          </div>
          <div className="text-white">
            <h1 className="font-bold text-xl">Cabinet Dentaire</h1>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-gray-50 h-14">
              <TabsTrigger
                value="login"
                className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#0d3d3d] data-[state=active]:shadow-none py-3 font-medium"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#0d3d3d] data-[state=active]:shadow-none py-3 font-medium"
              >
                Inscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0d3d3d] flex items-center gap-2">
                  Bon retour <span className="text-2xl">👋</span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre espace</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 text-sm">
                    Adresse email <span className="text-red-500">*</span>
                    <span className="block text-xs text-gray-400 mt-1 font-normal">
                      Doctor: doctor@dental.ma | Secrétaire: receptionist@dental.ma
                    </span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-gray-200 focus:border-[#0d3d3d] focus:ring-[#0d3d3d] rounded-lg"
                    placeholder="votre@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 text-sm">
                    Mot de passe <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-gray-200 focus:border-[#0d3d3d] focus:ring-[#0d3d3d] rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-[#0d3d3d] data-[state=checked]:bg-[#0d3d3d] data-[state=checked]:border-[#0d3d3d]"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                      Se souvenir
                    </Label>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setResetStep('email');
                      setResetError('');
                      setResetMessage('');
                    }}
                    className="text-sm text-[#0d3d3d] hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#0d3d3d] hover:bg-[#1a4d4d] text-white font-medium rounded-lg"
                >
                  Se connecter →
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Pas encore de compte ?{' '}
                <button
                  onClick={() => setActiveTab('register')}
                  className="text-[#0d3d3d] font-medium hover:underline"
                >
                  S'inscrire ici
                </button>
              </p>

              {/* Demo Accounts */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center mb-4">▼ Comptes de démonstration</p>
                <div className="grid grid-cols-2 gap-3">
                  {demoUsers.map((demoUser) => (
                    <button
                      key={demoUser.id}
                      onClick={() => handleDemoLogin(demoUser)}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-[#0d3d3d] hover:bg-gray-50 transition-colors text-left"
                    >
                      <Avatar className="w-8 h-8 bg-[#0d3d3d]">
                        <AvatarFallback className="bg-[#0d3d3d] text-white text-xs">
                          {demoUser.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{demoUser.name}</p>
                        <p className="text-xs text-gray-500">{demoUser.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#0d3d3d]">Créer un compte</h2>
                <p className="text-gray-500 text-sm mt-1">Rejoignez notre cabinet dentaire</p>
                <p className="text-xs text-gray-400 mt-3 bg-blue-50 p-2 rounded">
                  📧 <strong>Formats d'email:</strong><br/>
                  • Docteur: name@doctor.ma<br/>
                  • Secrétaire: name@secretariat.ma<br/>
                  • Patient: votre email personnel
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 text-sm">
                    Nom complet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={regFullName}
                    onChange={(e) => {
                      setRegFullName(e.target.value);
                      setRegError('');
                    }}
                    className="h-11 border-gray-200 focus:border-[#0d3d3d] focus:ring-[#0d3d3d] rounded-lg"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regEmail" className="text-gray-700 text-sm">
                    Adresse email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="regEmail"
                    type="email"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      setRegError('');
                    }}
                    className="h-11 border-gray-200 focus:border-[#0d3d3d] focus:ring-[#0d3d3d] rounded-lg"
                    placeholder="nom@doctor.ma ou votre@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regPassword" className="text-gray-700 text-sm">
                    Mot de passe <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="regPassword"
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        setRegError('');
                      }}
                      className="h-11 border-gray-200 focus:border-[#0d3d3d] focus:ring-[#0d3d3d] rounded-lg pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regConfirmPassword" className="text-gray-700 text-sm">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="regConfirmPassword"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value);
                        setRegError('');
                      }}
                      className="h-11 border-gray-200 focus:border-[#0d3d3d] focus:ring-[#0d3d3d] rounded-lg pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showRegConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {regError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{regError}</p>}
                {regMessage && <p className="text-green-600 text-sm bg-green-50 p-3 rounded">{regMessage}</p>}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#0d3d3d] hover:bg-[#1a4d4d] text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Inscription en cours...' : 'S\'inscrire →'}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Déjà un compte ?{' '}
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setRegError('');
                    setRegMessage('');
                  }}
                  className="text-[#0d3d3d] font-medium hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>

    {/* Forgot Password Modal */}
    {showForgotPassword && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0d3d3d]">Réinitialiser le mot de passe</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetStep('email');
                  setForgotEmail('');
                  setResetError('');
                  setResetMessage('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Email */}
            {resetStep === 'email' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">Entrez votre email pour recevoir un code de vérification</p>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">Adresse email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setResetError('');
                    }}
                    placeholder="votre@email.com"
                    className="h-11 border-gray-200 focus:border-[#0d3d3d] rounded-lg"
                  />
                </div>
                {resetError && <p className="text-red-500 text-sm">{resetError}</p>}
                {resetMessage && <p className="text-green-600 text-sm">{resetMessage}</p>}
                <Button
                  onClick={handleForgotPasswordSubmit}
                  disabled={isLoading || !forgotEmail}
                  className="w-full h-11 bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Envoi...' : 'Envoyer le code'}
                </Button>
              </div>
            )}

            {/* Step 2: Verification Code */}
            {resetStep === 'code' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">Entrez le code de vérification envoyé à {forgotEmail}</p>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">Code de vérification <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setResetError('');
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="h-11 border-gray-200 focus:border-[#0d3d3d] rounded-lg text-center font-mono text-lg tracking-widest"
                  />
                </div>
                {resetError && <p className="text-red-500 text-sm">{resetError}</p>}
                {resetMessage && <p className="text-green-600 text-sm">{resetMessage}</p>}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setResetStep('email')}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 h-11 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleVerificationCodeSubmit}
                    disabled={isLoading || !verificationCode || verificationCode.length < 4}
                    className="flex-1 h-11 bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Vérification...' : 'Vérifier'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {resetStep === 'password' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">Entrez votre nouveau mot de passe</p>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">Nouveau mot de passe <span className="text-red-500">*</span></Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setResetError('');
                    }}
                    placeholder="••••••••"
                    className="h-11 border-gray-200 focus:border-[#0d3d3d] rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm">Confirmer le mot de passe <span className="text-red-500">*</span></Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setResetError('');
                    }}
                    placeholder="••••••••"
                    className="h-11 border-gray-200 focus:border-[#0d3d3d] rounded-lg"
                  />
                </div>
                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                  • Au moins 8 caractères<br />
                  • Les deux mots de passe doivent correspondre
                </div>
                {resetError && <p className="text-red-500 text-sm">{resetError}</p>}
                {resetMessage && <p className="text-green-600 text-sm">{resetMessage}</p>}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setResetStep('code')}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 h-11 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handleResetPasswordSubmit}
                    disabled={isLoading || !newPassword || !confirmPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                    className="flex-1 h-11 bg-[#0d3d3d] hover:bg-[#1a4d4d] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Réinitialisation...' : 'Réinitialiser'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
