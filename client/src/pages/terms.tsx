
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  const { data: pageData } = useQuery({
    queryKey: ['page', 'terms'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pages');
      const data = await response.json();
      return data.find((page: any) => page.type === 'terms' && page.isPublished);
    }
  });

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
                <p className="text-gray-600">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{pageData.title}</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {pageData.content}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
