"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  ImagePlus,
  Loader2,
  Lock,
  Plus,
  Unlock,
  Upload,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
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

import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

import { itemFormSchema, ItemFormValues } from "@/lib/schemas/item-schema"
import { useCategorySelect } from "../hooks"
import type { Category } from "../types"
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
      unit: "个",
      quantity: 1,
      isStockFixed: false,
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

  // Category handling via custom hook
  const categorySelect = useCategorySelect({
    initialCategories: categories,
    onSelect: (id) => form.setValue("categoryId", id),
  })

  // Drag and drop state for image upload area
  const [isDragging, setIsDragging] = useState(false)

  // Handle drag events for visual feedback
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Future: Handle file drop here
  }, [])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          {/* 1. 基础信息区域 */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* 左侧：图片预览与上传 - 固定正方形尺寸 */}
            <div className="w-[120px] space-y-2 flex-shrink-0 mx-auto sm:mx-0">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <motion.div
                      className={cn(
                        "relative aspect-square w-[120px] rounded-xl border-2 border-dashed bg-muted/30 flex items-center justify-center overflow-hidden transition-colors group cursor-pointer",
                        isDragging
                          ? "border-primary bg-primary/10 scale-105"
                          : "hover:bg-muted/50"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      animate={{
                        scale: isDragging ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
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
                          {isDragging ? (
                            <>
                              <Upload className="h-6 w-6 mx-auto text-primary mb-1 animate-bounce" />
                              <span className="text-[10px] text-primary block font-medium">
                                释放以上传
                              </span>
                            </>
                          ) : (
                            <>
                              <ImagePlus className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                              <span className="text-[10px] text-muted-foreground block">
                                拖拽或点击添加
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </motion.div>
                    <FormControl>
                      <Input
                        placeholder="图片链接..."
                        className="h-8 text-xs mt-2 w-[120px]"
                        {...field}
                        value={field.value || ""}
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
                    <FormItem className="flex flex-col">
                      <FormLabel>分类</FormLabel>
                      <Popover
                        open={categorySelect.open}
                        onOpenChange={categorySelect.setOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? categorySelect.categories.find(
                                    (category: Category) =>
                                      category.id === field.value
                                  )?.name
                                : "选择分类"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="搜索或新建分类..."
                              value={categorySelect.searchValue}
                              onValueChange={categorySelect.setSearchValue}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <div className="flex flex-col items-center justify-center p-2 gap-2">
                                  <p className="text-sm text-muted-foreground">
                                    没有找到分类
                                  </p>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full h-8 cursor-pointer"
                                    disabled={categorySelect.isCreating}
                                    onClick={() =>
                                      categorySelect.handleCreate(
                                        categorySelect.searchValue
                                      )
                                    }
                                  >
                                    {categorySelect.isCreating ? (
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    ) : (
                                      <Plus className="mr-2 h-3 w-3" />
                                    )}
                                    创建 "{categorySelect.searchValue}"
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {categorySelect.categories.map(
                                  (category: Category) => (
                                    <CommandItem
                                      value={category.name}
                                      key={category.id}
                                      onSelect={() => {
                                        categorySelect.handleSelect(category.id)
                                      }}
                                    >
                                      {category.name}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          category.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  )
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                        <Input
                          placeholder="选填"
                          {...field}
                          value={field.value || ""}
                        />
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
                        value={field.value ?? ""}
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
                    <FormLabel className="flex items-center gap-2">
                      库存
                      <FormField
                        control={form.control}
                        name="isStockFixed"
                        render={({ field: lockField }) => (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => lockField.onChange(!lockField.value)}
                            className={cn(
                              "h-6 w-6",
                              lockField.value
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                            title={
                              lockField.value
                                ? "固定库存已开启"
                                : "点击锁定库存"
                            }
                          >
                            {lockField.value ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <Unlock className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        {...field}
                        disabled={form.watch("isStockFixed")}
                        className={cn(
                          form.watch("isStockFixed") &&
                            "bg-muted cursor-not-allowed"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 规格输入 (Quantity + Unit) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>规格数量</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="如 500"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>单位</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择单位" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="个">个</SelectItem>
                        <SelectItem value="ml">ml (毫升)</SelectItem>
                        <SelectItem value="L">L (升)</SelectItem>
                        <SelectItem value="g">g (克)</SelectItem>
                        <SelectItem value="kg">kg (千克)</SelectItem>
                        <SelectItem value="片">片</SelectItem>
                        <SelectItem value="袋">袋</SelectItem>
                        <SelectItem value="盒">盒</SelectItem>
                        <SelectItem value="瓶">瓶</SelectItem>
                        <SelectItem value="支">支</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTag(tag)}
                      className="h-4 w-4 p-0 ml-0.5 text-muted-foreground hover:text-foreground hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
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
                  name="shelfLifeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        保质期(天)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="h-9 text-sm"
                          placeholder="如 365"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
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

              {/* Row 2: Notification Toggle with Animation */}
              <FormField
                control={form.control}
                name="notifyEnabled"
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        过期提醒
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        {field.value ? "到期前自动提醒" : "已关闭提醒通知"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <AnimatePresence mode="wait">
                        {field.value && (
                          <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{
                              duration: 0.2,
                              ease: "easeOut",
                            }}
                          >
                            <FormField
                              control={form.control}
                              name="notifyAdvanceDays"
                              render={({ field: daysField }) => (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    提前
                                  </span>
                                  <Select
                                    value={String(daysField.value)}
                                    onValueChange={(val) =>
                                      daysField.onChange(Number(val))
                                    }
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-8 w-[100px] text-xs">
                                        <SelectValue placeholder="天数" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {[0, 1, 2, 3, 5, 7, 10, 14, 30].map(
                                        (day) => (
                                          <SelectItem
                                            key={day}
                                            value={String(day)}
                                          >
                                            {day === 0 ? "当天" : `${day} 天`}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  </div>
                )}
              />
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
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
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
