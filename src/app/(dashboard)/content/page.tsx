import { ContentList } from '@/components/content/content-list';

export const metadata = {
  title: 'Content Library | Creator Attribution Dashboard',
};

export default function ContentPage() {
  return (
    <div className="max-w-7xl mx-auto py-2">
      <ContentList />
    </div>
  );
}
