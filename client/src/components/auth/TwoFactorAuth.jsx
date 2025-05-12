import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/config/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSelector } from 'react-redux';

function TwoFactorAuth({ isOpen, onClose }) {
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/2fa/status');
        setIs2FAEnabled(response.data.isEnabled);
        // Réinitialiser le QR code et le token quand on ouvre la boîte de dialogue
        setQrCode('');
        setToken('');
      } catch (error) {
        console.error('Error checking 2FA status:', error);
      }
    };

    if (isOpen) {
      check2FAStatus();
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/api/auth/2fa/generate');
      
      if (response.data.success) {
        setQrCode(response.data.qrCode);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la génération du QR code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token) {
      toast({
        title: 'Code requis',
        description: 'Veuillez entrer le code de vérification',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/api/auth/2fa/verify', { token });
      
      if (response.data.success) {
        setIs2FAEnabled(true);
        toast({
          title: 'Succès',
          description: '2FA activé avec succès',
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Code invalide',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/api/auth/2fa/disable');
      
      if (response.data.success) {
        setIs2FAEnabled(false);
        setQrCode(''); // Réinitialiser le QR code
        setToken(''); // Réinitialiser le token
        toast({
          title: 'Succès',
          description: '2FA désactivé avec succès',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Erreur lors de la désactivation du 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuration 2FA</DialogTitle>
          <DialogDescription>
            {is2FAEnabled ? 
              'Votre authentification à deux facteurs est actuellement activée.' :
              'Scannez le QR code avec Google Authenticator et entrez le code de vérification'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {is2FAEnabled ? (
            <Button
              onClick={handleDisable2FA}
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              {isLoading ? 'Désactivation en cours...' : 'Désactiver 2FA'}
            </Button>
          ) : !qrCode ? (
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Génération en cours...' : 'Générer QR Code'}
            </Button>
          ) : (
            <>
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Code de vérification"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <Button
                  onClick={handleVerify}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Vérification en cours...' : 'Vérifier et Activer'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TwoFactorAuth; 