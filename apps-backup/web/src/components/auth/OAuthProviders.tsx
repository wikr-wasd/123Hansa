import React from 'react';
import { Button } from '../ui/button';
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin, FaGithub, FaApple } from 'react-icons/fa';
import { RiMetaFill } from 'react-icons/ri';

interface OAuthProvidersProps {
  onProviderClick: (provider: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const OAuthProviders: React.FC<OAuthProvidersProps> = ({
  onProviderClick,
  isLoading = false,
  disabled = false,
}) => {
  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: <FcGoogle className="w-5 h-5" />,
      bgColor: 'bg-white border-gray-300',
      textColor: 'text-gray-700',
      hoverColor: 'hover:bg-gray-50',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <FaLinkedin className="w-5 h-5 text-blue-600" />,
      bgColor: 'bg-white border-gray-300',
      textColor: 'text-gray-700',
      hoverColor: 'hover:bg-gray-50',
    },
    {
      id: 'meta',
      name: 'Meta',
      icon: <RiMetaFill className="w-5 h-5 text-blue-500" />,
      bgColor: 'bg-white border-gray-300',
      textColor: 'text-gray-700',
      hoverColor: 'hover:bg-gray-50',
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <FaGithub className="w-5 h-5 text-gray-900" />,
      bgColor: 'bg-white border-gray-300',
      textColor: 'text-gray-700',
      hoverColor: 'hover:bg-gray-50',
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: <FaApple className="w-5 h-5 text-gray-900" />,
      bgColor: 'bg-white border-gray-300',
      textColor: 'text-gray-700',
      hoverColor: 'hover:bg-gray-50',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Eller fortsätt med</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className={`
              ${provider.bgColor}
              ${provider.textColor}
              ${provider.hoverColor}
              border
              transition-colors
              duration-200
              disabled:opacity-50
              disabled:cursor-not-allowed
            `}
            onClick={() => onProviderClick(provider.id)}
            disabled={disabled || isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              {provider.icon}
              <span className="text-sm font-medium">{provider.name}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default OAuthProviders;