import ConditionalLayout from '../../components/ConditionalLayout';
import AppWrapper from '../../components/AppWrapper';

export const metadata = {
  title: 'SliqInvoice Dashboard',
  description: 'Professional invoice management system',
};

export default function DashboardLayout({ children }) {
  return (
    <AppWrapper>
      <ConditionalLayout>
        {children}
      </ConditionalLayout>
    </AppWrapper>
  );
} 