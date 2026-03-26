"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Users, Zap, ArrowRight, TrendingUp, Award, Shield, LogIn, Star, CheckCircle, Sparkles, CreditCard } from "lucide-react";
import PricingPlans from "@/components/pricing-plans";
import { useRouter } from "next/navigation";

const DEMO_IMAGES = [
  { src: "https://raw.githubusercontent.com/ungden/snapstudio/main/docs/images/553323811_10163378911118750_3011025545344987494_n.jpg", alt: "Demo th\u1eddi trang - \u00c1o s\u1ecdc" },
  { src: "https://raw.githubusercontent.com/ungden/snapstudio/main/docs/images/555460282_10163378911348750_5147601682514173002_n.jpg", alt: "Demo gi\u00e0y Nike" },
  { src: "https://raw.githubusercontent.com/ungden/snapstudio/main/docs/images/558764108_10163415838538750_7584497244626114108_n.jpg", alt: "Demo \u00e1o len" },
];

const stats = [
  { number: '50,000+', label: '\u1ea2nh \u0111\u00e3 t\u1ea1o th\u00e0nh c\u00f4ng', icon: TrendingUp, color: 'text-blue-600' },
  { number: '2,500+', label: 'Doanh nghi\u1ec7p tin d\u00f9ng', icon: Users, color: 'text-green-600' },
  { number: '4.9/5', label: '\u0110\u00e1nh gi\u00e1 t\u1eeb kh\u00e1ch h\u00e0ng', icon: Award, color: 'text-yellow-600' },
  { number: '99.9%', label: 'Th\u1eddi gian ho\u1ea1t \u0111\u1ed9ng', icon: Shield, color: 'text-purple-600' }
];

const features = [
  {
    icon: Zap,
    title: "B\u1ed9 \u1ea3nh marketing ho\u00e0n ch\u1ec9nh trong 30 gi\u00e2y",
    description: "T\u1eeb 1 \u1ea3nh g\u1ed1c t\u1ea1o ra 12 \u1ea3nh \u0111\u1ea7y \u0111\u1ee7 cho m\u1ecdi n\u1ec1n t\u1ea3ng: Website, Facebook, Instagram, TikTok, Shopee, Lazada",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Star,
    title: "4 phong c\u00e1ch ph\u1ee7 s\u00f3ng to\u00e0n b\u1ed9 customer journey",
    description: "\u1ea2nh tr\u01b0ng b\u00e0y s\u1ea3n ph\u1ea9m, ng\u01b0\u1eddi m\u1eabu th\u1ef1c t\u1ebf, content m\u1ea1ng x\u00e3 h\u1ed9i, banner qu\u1ea3ng c\u00e1o - \u0111\u1ee7 t\u1eeb awareness \u0111\u1ebfn conversion",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: CheckCircle,
    title: "Nh\u1ea5t qu\u00e1n th\u01b0\u01a1ng hi\u1ec7u tr\u00ean m\u1ecdi k\u00eanh",
    description: "T\u00f4ng m\u00e0u, phong c\u00e1ch, ch\u1ea5t l\u01b0\u1ee3ng \u0111\u1ed3ng nh\u1ea5t - x\u00e2y d\u1ef1ng brand identity m\u1ea1nh m\u1ebd v\u00e0 chuy\u00ean nghi\u1ec7p",
    color: "bg-green-100 text-green-600"
  }
];

const testimonials = [
  {
    name: "Ch\u1ecb Minh Anh",
    role: "Marketing Manager - Th\u1eddi trang MINA",
    content: "SnapStudio gi\u00fap team m\u00ecnh c\u00f3 \u0111\u1ee7 \u1ea3nh cho c\u1ea3 n\u0103m! Website, Facebook Ads, Instagram Stories, TikTok - t\u1ea5t c\u1ea3 \u0111\u1ec1u c\u00f3 \u1ea3nh \u0111\u1eb9p v\u00e0 nh\u1ea5t qu\u00e1n th\u01b0\u01a1ng hi\u1ec7u.",
    avatar: "https://ui-avatars.com/api/?name=Minh+Anh&background=random&color=fff",
    industry: 'fashion'
  },
  {
    name: "Anh V\u0103n H\u00f9ng",
    role: "Founder - Chu\u1ed7i Qu\u00e1n H\u00f9ng K\u00fd",
    content: "T\u1eeb menu in, poster qu\u00e1n, \u0111\u1ebfn Facebook, Grab Food - t\u1ea5t c\u1ea3 \u0111\u1ec1u d\u00f9ng \u1ea3nh t\u1eeb SnapStudio. Kh\u00e1ch th\u1ea5y \u1ea3nh \u0111\u1eb9p, order nhi\u1ec1u h\u01a1n h\u1eb3n!",
    avatar: "https://ui-avatars.com/api/?name=V%C4%83n+H%C3%B9ng&background=random&color=fff",
    industry: 'f_b'
  },
  {
    name: "Ch\u1ecb Th\u1ecb Mai",
    role: "CEO - Mai Beauty House",
    content: "1 l\u1ea7n ch\u1ee5p c\u00f3 ngay content cho c\u1ea3 th\u00e1ng: \u1ea3nh website, banner Shopee, story Instagram, video TikTok. Marketing team kh\u00f4ng bao gi\u1edd thi\u1ebfu \u1ea3nh!",
    avatar: "https://ui-avatars.com/api/?name=Th%E1%BB%8B+Mai&background=random&color=fff",
    industry: 'beauty'
  }
];

const comparisonData = [
  { aspect: 'S\u1ed1 n\u1ec1n t\u1ea3ng ph\u1ee7 s\u00f3ng', traditional: '1-2 n\u1ec1n t\u1ea3ng', snapstudio: 'T\u1ea5t c\u1ea3 n\u1ec1n t\u1ea3ng', improvement: 'Ph\u1ee7 s\u00f3ng to\u00e0n di\u1ec7n' },
  { aspect: 'Th\u1eddi gian c\u00f3 \u1ea3nh \u0111\u1ee7 d\u00f9ng', traditional: '2-4 tu\u1ea7n', snapstudio: '30 gi\u00e2y', improvement: 'Nhanh h\u01a1n 99%' },
  { aspect: 'Chi ph\u00ed cho \u0111a n\u1ec1n t\u1ea3ng', traditional: '10-50 tri\u1ec7u', snapstudio: '99k-5M', improvement: 'Ti\u1ebft ki\u1ec7m 90%' },
  { aspect: 'T\u00ednh nh\u1ea5t qu\u00e1n th\u01b0\u01a1ng hi\u1ec7u', traditional: 'Kh\u00f3 \u0111\u1ed3ng b\u1ed9', snapstudio: 'Ho\u00e0n to\u00e0n nh\u1ea5t qu\u00e1n', improvement: 'Brand identity m\u1ea1nh' }
];

export default function Home() {
  const router = useRouter();

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg pt-24 pb-16">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative container-custom">
          <div className="text-center max-w-5xl mx-auto animate-fade-in-up">
            <Badge className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-0 px-6 py-2 mb-8 animate-scale-in">
              <Sparkles className="w-4 h-4" />
              Gi\u1ea3i ph\u00e1p h\u00ecnh \u1ea3nh marketing \u0111a n\u1ec1n t\u1ea3ng s\u1ed1 1 Vi\u1ec7t Nam
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 text-balance">
              <span className="gradient-text">SnapStudio</span>
              <span className="text-gray-900">.app</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed text-balance max-w-4xl mx-auto">
              <span className="font-bold text-purple-600">1 \u1ea3nh s\u1ea3n ph\u1ea9m</span> \u2192
              <span className="font-bold text-blue-600"> 12 \u1ea3nh marketing ho\u00e0n ch\u1ec9nh</span> cho
              <span className="font-bold text-green-600"> m\u1ecdi n\u1ec1n t\u1ea3ng</span>: Website, Social Media, E-commerce, Qu\u1ea3ng c\u00e1o
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                variant="default"
                className="btn-primary text-lg px-8 py-4 animate-scale-in animation-delay-200"
                onClick={() => router.push('/login')}
              >
                <LogIn className="w-5 h-5 mr-2" />
                T\u1ea1o b\u1ed9 \u1ea3nh marketing ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="btn-secondary text-lg px-8 py-4 animate-scale-in animation-delay-400"
                onClick={() => {
                  const pricingSection = document.getElementById('pricing');
                  if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Xem g\u00f3i d\u1ecbch v\u1ee5
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`text-center animate-fade-in-up`}
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-3 shadow-lg ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Showcase */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              B\u1ed9 \u1ea3nh marketing ho\u00e0n ch\u1ec9nh
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              1 \u1ea3nh g\u1ed1c \u2192 12 \u1ea3nh marketing chuy\u00ean nghi\u1ec7p v\u1edbi 4 phong c\u00e1ch: <strong>Seeding</strong> \u2022 <strong>Social</strong> \u2022 <strong>Model</strong> \u2022 <strong>Display</strong>
            </p>
          </div>
          <div className="space-y-8">
            {DEMO_IMAGES.map((demo, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                <img
                  src={demo.src}
                  alt={demo.alt}
                  className="w-full h-auto"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding gradient-bg">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-balance">
              T\u1ea1i sao doanh nghi\u1ec7p ch\u1ecdn SnapStudio?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gi\u1ea3i ph\u00e1p h\u00ecnh \u1ea3nh marketing to\u00e0n di\u1ec7n, ti\u1ebft ki\u1ec7m th\u1eddi gian v\u00e0 chi ph\u00ed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="card-hover bg-white border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${feature.color}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-balance">
              So s\u00e1nh v\u1edbi c\u00e1ch l\u00e0m marketing truy\u1ec1n th\u1ed1ng
            </h2>
            <p className="text-xl text-gray-600">Ph\u1ee7 s\u00f3ng to\u00e0n di\u1ec7n, nh\u1ea5t qu\u00e1n th\u01b0\u01a1ng hi\u1ec7u, ti\u1ebft ki\u1ec7m chi ph\u00ed</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden shadow-2xl border-0">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="grid grid-cols-4 p-6">
                  <div className="font-semibold text-lg">Ti\u00eau ch\u00ed</div>
                  <div className="font-semibold text-lg">C\u00e1ch truy\u1ec1n th\u1ed1ng</div>
                  <div className="font-semibold text-lg">SnapStudio</div>
                  <div className="font-semibold text-lg">L\u1ee3i \u00edch</div>
                </div>
              </div>
              {comparisonData.map((row, index) => (
                <div key={index} className={`grid grid-cols-4 p-6 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="font-medium text-gray-900">{row.aspect}</div>
                  <div className="text-gray-600">{row.traditional}</div>
                  <div className="text-blue-600 font-semibold">{row.snapstudio}</div>
                  <div className="text-green-600 font-bold">{row.improvement}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding gradient-bg">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-balance">
              Doanh nghi\u1ec7p t\u1eeb m\u1ecdi ng\u00e0nh tin d\u00f9ng SnapStudio
            </h2>
            <p className="text-xl text-gray-600">H\u01a1n 2,500 doanh nghi\u1ec7p \u0111\u00e3 c\u00f3 b\u1ed9 \u1ea3nh marketing ho\u00e0n ch\u1ec9nh</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover bg-white border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic mb-4">"{testimonial.content}"</p>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingPlans />

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container-custom text-center">
          <div className="animate-float">
            <Sparkles className="w-16 h-16 text-white/80 mx-auto mb-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            S\u1eb5n s\u00e0ng c\u00f3 b\u1ed9 \u1ea3nh marketing ho\u00e0n ch\u1ec9nh?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            T\u1ea1o ngay b\u1ed9 \u1ea3nh \u0111\u1ea7y \u0111\u1ee7 cho m\u1ecdi n\u1ec1n t\u1ea3ng marketing c\u1ee7a doanh nghi\u1ec7p b\u1ea1n.
          </p>
          <Button
            size="lg"
            variant="default"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300"
            onClick={() => router.push('/login')}
          >
            <LogIn className="w-5 h-5 mr-2" />
            T\u1ea1o b\u1ed9 \u1ea3nh marketing ngay
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </>
  );
}
