import { SalesTable } from '@/components/sales/sales-table';

export const metadata = {
  title: 'Sales & Revenue Log | Creator Attribution Dashboard',
};

export default function SalesPage() {
  return (
    <div className="max-[#111111] max-w-7xl mx-auto py-2">
      <SalesTable />
    </div>
  );
}
