import { LeadTable } from '@/components/leads/lead-table';

export const metadata = {
  title: 'Captured Leads | Creator Attribution Dashboard',
};

export default function LeadsPage() {
  return (
    <div className="max-w-7xl mx-auto py-2">
      <LeadTable />
    </div>
  );
}
