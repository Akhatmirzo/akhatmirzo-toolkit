'use client';

import { Avatar, Badge, Button, Card } from '@akhatmirzo/ui';

export default function CardBasic() {
  return (
    <Card className="w-full max-w-md">
      <Card.Header
        title="Buyurtma #1042"
        description="Bugun, 14:20"
        action={
          <Badge color="primary" dot>
            Yangi
          </Badge>
        }
      />
      <Card.Body>
        <div className="flex items-center gap-3">
          <Avatar name="Sarvar Abduxoliqov" size="sm" />
          <div className="flex flex-col">
            <span className="font-medium">Sarvar Abduxoliqov</span>
            <span className="text-text-muted">3 ta mahsulot · 245 000 so'm</span>
          </div>
        </div>
      </Card.Body>
      <Card.Footer className="justify-end">
        <Button variant="ghost">Bekor qilish</Button>
        <Button variant="primary">Tasdiqlash</Button>
      </Card.Footer>
    </Card>
  );
}
