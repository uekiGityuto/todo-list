"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "@/components/check";
import { FilterChip } from "@/components/filter-chip";
import { SectionHeader } from "@/components/section-header";
import { TabBar } from "@/components/tab-bar";
import { Sidebar } from "@/components/sidebar";
import { TaskCard } from "@/components/task-card";
import { NextTaskCard } from "@/components/next-task-card";
import { NextTaskHero } from "@/components/next-task-hero";
import { CalendarCell } from "@/components/calendar-cell";

export default function Home() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar activeItem={activeTab} onItemChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:p-10">
          <h1 className="mb-8 text-3xl font-bold">Component Showcase</h1>

          {/* Buttons */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">Button</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button size="sm">Primary sm</Button>
              <Button size="sm" variant="secondary">Secondary sm</Button>
              <Button size="sm" variant="outlined">Outlined sm</Button>
              <Button size="sm" variant="ghost">Ghost sm</Button>
            </div>
          </section>

          {/* Badge */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">Badge</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </section>

          {/* Input */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">Input</h2>
            <div className="flex max-w-sm flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sample">タスク名</Label>
                <Input id="sample" placeholder="タスク名を入力..." />
              </div>
            </div>
          </section>

          {/* Check */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">Check</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Check checked={checked1} onToggle={() => setChecked1(!checked1)} />
                <span className="text-sm">Empty</span>
              </div>
              <div className="flex items-center gap-2">
                <Check checked={checked2} onToggle={() => setChecked2(!checked2)} />
                <span className="text-sm">Done</span>
              </div>
            </div>
          </section>

          {/* FilterChip */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">FilterChip</h2>
            <div className="flex items-center gap-2">
              {["all", "todo", "done"].map((key) => (
                <FilterChip
                  key={key}
                  label={key === "all" ? "すべて" : key === "todo" ? "未完了" : "完了"}
                  active={activeFilter === key}
                  onClick={() => setActiveFilter(key)}
                />
              ))}
            </div>
          </section>

          {/* SectionHeader */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">SectionHeader</h2>
            <div className="max-w-sm">
              <SectionHeader title="今日のタスク" action="すべて見る" />
            </div>
          </section>

          {/* NextTaskHero */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">NextTaskHero</h2>
            <div className="max-w-[350px]">
              <NextTaskHero
                title={"インスタ投稿の\n画像を作成する"}
                category="インスタ投稿"
                duration="30分"
              />
            </div>
          </section>

          {/* NextTaskCard */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">NextTaskCard</h2>
            <div className="max-w-[350px]">
              <NextTaskCard
                title="タスク名がここに入る"
                duration="30分"
                category="カテゴリ"
              />
            </div>
          </section>

          {/* TaskCard */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">TaskCard</h2>
            <div className="flex max-w-[350px] flex-col gap-2">
              <TaskCard
                title="タスク名がここに入る"
                duration="30分"
                category="インスタ投稿"
              />
              <TaskCard
                title="完了したタスク"
                duration="15分"
                category="ブログ"
                checked
              />
            </div>
          </section>

          {/* CalendarCell */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold">CalendarCell</h2>
            <div className="flex gap-0.5">
              <CalendarCell day={1} tasks={["タスクA", "タスクB"]} />
              <CalendarCell day={2} tasks={["タスクC"]} />
              <CalendarCell day={3} tasks={[]} />
              <CalendarCell day={4} isToday tasks={["A", "B", "C"]} />
              <CalendarCell day={5} tasks={[]} />
            </div>
          </section>
        </main>

        {/* TabBar */}
        <div className="fixed bottom-0 left-0 right-0">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
}
