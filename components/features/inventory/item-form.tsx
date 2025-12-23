"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CalendarIcon, Loader2, Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { itemFormSchema, ItemFormValues } from "@/lib/schemas/item-schema"
import { Category } from "@prisma/client"
import Image from "next/image"

interface ItemFormProps {
  defaultValues?: Partial<ItemFormValues>
  categories: Category[]
  onSubmit: (data: ItemFormValues) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function ItemForm({
  defaultValues,
  categories,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ItemFormProps) {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      stock: 1,
      notifyAdvanceDays: 3,
      notifyEnabled: true,
      tags: [],
      ...defaultValues,
    },
  })

  // Tag input state
  const [tagInput, setTagInput] = useState("")

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    const currentTags = form.getValues("tags") || []
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue("tags", [...currentTags, tagInput.trim()])
    }
    setTagInput("")
  }

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues("tags") || []
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* 1. 基础信息区域 */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* 左侧：图片预览与上传 */}
            <div className="sm:w-[120px] space-y-2 flex-shrink-0">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative h-[120px] w-full sm:w-[120px] rounded-xl border-2 border-dashed bg-muted/30 flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors group">
                      {field.value ? (
                        <>
                          <Image
                            src={field.value}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              更换图片
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <Plus className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                          <span className="text-[10px] text-muted-foreground block">
                            添加图片
                          </span>
                        </div>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        placeholder="图片链接..."
                        className="h-8 text-xs mt-2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 右侧：主要信息 */}
            <div className="flex-1 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>物品名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：电动牙刷" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>分类</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择分类" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>品牌</FormLabel>
                      <FormControl>
                        <Input placeholder="选填" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* 2. 库存与标签 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>价格</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>库存</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags - Compact View */}
            <FormItem className="sm:row-span-1">
              <FormLabel>标签</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="输入标签按回车..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap min-h-[1.5rem]">
                {form.watch("tags")?.map((tag) => (
                  <div
                    key={tag}
                    className="badge badge-secondary flex items-center gap-1 bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded-full text-xs border border-secondary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </FormItem>
          </div>

          {/* 3. 生命周期卡片 (LifeCycle Hub) */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-4 border-b bg-muted/10">
              <h3 className="font-semibold leading-none tracking-tight text-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                生命周期与提醒
              </h3>
            </div>

            <div className="p-4 space-y-6">
              {/* Row 1: Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs text-muted-foreground">
                        硬性过期日期
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              size="sm"
                              className={cn(
                                "w-full pl-3 text-left font-normal text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy-MM-dd")
                              ) : (
                                <span>选择日期</span>
                              )}
                              <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastOpenedAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs text-muted-foreground">
                        上次更换/使用
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              size="sm"
                              className={cn(
                                "w-full pl-3 text-left font-normal text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "yyyy-MM-dd")
                              ) : (
                                <span>未记录</span>
                              )}
                              <CalendarIcon className="ml-auto h-3 w-3 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lifespanDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        建议周期(天)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          size={10}
                          className="h-9 text-sm"
                          placeholder="如 90"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Notification Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                <FormField
                  control={form.control}
                  name="notifyEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          过期提醒
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("notifyEnabled") && (
                  <FormField
                    control={form.control}
                    name="notifyAdvanceDays"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          提前
                        </span>
                        <Select
                          value={String(field.value)}
                          onValueChange={(val) => field.onChange(Number(val))}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 w-[100px] text-xs">
                              <SelectValue placeholder="天数" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[0, 1, 2, 3, 5, 7, 10, 14, 30].map((day) => (
                              <SelectItem key={day} value={String(day)}>
                                {day === 0 ? "当天" : `${day} 天`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 4. 备注 */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>备注/说明</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="备注更多细节..."
                    className="resize-none min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm p-4 -mx-4 -mb-4 mt-6 z-10">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存物品
          </Button>
        </div>
      </form>
    </Form>
  )
}
