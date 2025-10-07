import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Bot,
  HeartPulse,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const quickActions = [
  {
    title: "Empezar a Aprender",
    description: "Inicia tu ruta de aprendizaje personalizada.",
    icon: BookOpen,
    href: "/dashboard/learn",
  },
  {
    title: "Hablar con el Tutor",
    description: "Resuelve tus dudas financieras al instante.",
    icon: Bot,
    href: "/dashboard/tutor",
  },
  {
    title: "Evaluar mi Salud",
    description: "Obtén un diagnóstico de tu estado financiero.",
    icon: HeartPulse,
    href: "/dashboard/health",
  },
  {
    title: "Simular Presupuesto",
    description: "Planea tus metas y ahorros futuros.",
    icon: Target,
    href: "/dashboard/goals",
  },
];

export default function DashboardPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "dashboard-hero");

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card className="overflow-hidden">
        <div className="relative h-48 md:h-64 w-full">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt="Financial growth"
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-white">
              Bienvenido a FinLit Tutor
            </h1>
            <p className="mt-2 text-primary-foreground/80 max-w-2xl">
              Tu guía personal para el empoderamiento financiero. Empecemos a construir tu futuro.
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link href={action.href} key={action.title}>
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 hover:bg-accent/10">
                <CardHeader>
                  <action.icon className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="font-headline">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Progreso de Aprendizaje</CardTitle>
            <CardDescription>
              Continúa tu lección sobre "Principios Básicos de Ahorro".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progreso General del Curso</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <Progress value={45} aria-label="45% de progreso en el curso" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Lección Actual</span>
                <span className="text-sm text-muted-foreground">70%</span>
              </div>
              <Progress value={70} aria-label="70% de progreso en la lección actual" />
            </div>
            <Button>Continuar Aprendiendo</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Logros</CardTitle>
            <CardDescription>Tus insignias ganadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Award className="w-8 h-8" />
                </div>
                <Badge variant="secondary">Primer Ahorro</Badge>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Star className="w-8 h-8" />
                </div>
                <Badge variant="secondary">Lección Completa</Badge>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <Badge variant="secondary">Presupuesto Creado</Badge>
              </div>
              <div className="flex flex-col items-center gap-1 text-center text-muted-foreground/50">
                <div className="p-3 rounded-full bg-muted">
                  <Target className="w-8 h-8" />
                </div>
                <Badge variant="outline">Meta Alcanzada</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
