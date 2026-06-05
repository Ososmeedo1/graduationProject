import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4">
      <div className="max-w-md w-full text-center">
        <EmptyState
          title="Page Not Found"
          description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
          icon={<span className="text-4xl">404</span>}
        />
        <div className="mt-6">
          <Button onClick={() => navigate('/')} variant="primary">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
