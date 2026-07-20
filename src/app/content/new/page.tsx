import { ContentForm } from '@/components/content/content-form';

export const metadata = {
  title: 'Add New Content | Creator Attribution Dashboard',
};

export default function NewContentPage() {
  return (
    <div className="max-w-7xl mx-auto py-2">
      <ContentForm />
    </div>
  );
}
