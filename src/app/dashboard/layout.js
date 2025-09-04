import ConditionalLayout from '../../components/ConditionalLayout';

export const metadata = {
  title: 'SliqInvoice Dashboard',
  description: 'Professional invoice management system',
};

export default function DashboardLayout({ children }) {
  return (
      <ConditionalLayout>
        {children}
      </ConditionalLayout>
    
  );
} 