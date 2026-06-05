import React from 'react';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4">
      <div className="max-w-md w-full text-center">
        <AdminStateWrapper variant="forbidden" showBackButton />
      </div>
    </div>
  );
};

export default ForbiddenPage;
