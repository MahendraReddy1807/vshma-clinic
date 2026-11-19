import { Heart, GraduationCap, MapPin, Leaf } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';

export default function TrustBar() {
  const trustItems = [
    {
      icon: Heart,
      title: 'Individual Attention',
      desc: 'Care tailored to your constitution',
    },
    {
      icon: GraduationCap,
      title: `${CLINIC_INFO.qualification} Qualified`,
      desc: CLINIC_INFO.doctor,
    },
    {
      icon: MapPin,
      title: CLINIC_INFO.city,
      desc: 'In-clinic & online appointments',
    },
    {
      icon: Leaf,
      title: 'Natural Homeopathy',
      desc: 'Gentle, holistic principles',
    },
  ];

  return (
    <section className="bg-white/80 backdrop-blur-md border-y border-sage/20 py-8 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5 sm:gap-4 p-2 rounded-2xl hover:bg-mint/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-mint text-forest flex items-center justify-center shrink-0 shadow-sm border border-sage/20">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-forest text-sm sm:text-base leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-light">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
