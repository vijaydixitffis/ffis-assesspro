
import { Card, CardContent } from '@/components/ui/card';

export default function NoTopicSelected() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <p className="text-lg mb-2">No topic selected</p>
          <p className="text-muted-foreground">Please select a topic from the Topics Management page.</p>
        </div>
      </CardContent>
    </Card>
  );
}
