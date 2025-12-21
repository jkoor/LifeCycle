import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function InventoryPage() {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                    <Package className="h-8 w-8 text-primary" />
                    Inventory
                </h1>
                <p className="text-muted-foreground">
                    库存管理与物品追踪
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>物品总数</CardTitle>
                        <CardDescription>当前追踪的物品数量</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">0</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>分类统计</CardTitle>
                        <CardDescription>按类别分组的物品</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">0</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>即将过期</CardTitle>
                        <CardDescription>需要关注的物品</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">0</div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>快速开始</CardTitle>
                        <CardDescription>开始管理您的物品库存</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            库存管理功能即将推出...
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
