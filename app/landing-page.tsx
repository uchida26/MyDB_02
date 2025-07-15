import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import Image from "next/image"
import Link from 'next/link'

const gridStyle = {
  backgroundImage: `
    linear-gradient(to right, #f0f0f0 1px, transparent 1px),
    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px'
};

export default function LandingPage() {
  const { ref: logoRef, inView: logoInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { ref: titleRef, inView: titleInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { ref: subtitleRef, inView: subtitleInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { ref: imageRef, inView: imageInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const { ref: mottoRef, inView: mottoInView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <main className="min-h-screen font-sans bg-white bg-grid" style={gridStyle}>
      {/* 固定ロゴヘッダーとログインボタン */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-center">
          <motion.div 
            ref={logoRef}
            initial={{ opacity: 0, y: -20 }}
            animate={logoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* 半円の背景 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-white rounded-b-full shadow-lg" />
            {/* ロゴ */}
            <div className="relative pt-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/D-e3BT79WAbBt3ZeT60wXpC8DcE7vvJY.png"
                alt="MyDB Logo"
                width={80}
                height={80}
                priority
                className="relative z-10"
              />
            </div>
          </motion.div>
        </div>
        {/* ログインボタン */}
        <div className="absolute top-8 right-8 z-50"> {/* Updated position */}
          <Link 
            href="/login"
            className="px-8 py-3 text-gray-600 text-lg font-medium rounded-full bg-white hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-gray-200"
          >
            ログイン
          </Link>
        </div>
      </div>

      {/* メインコンテンツ（ロゴの高さ分のパディングを調整） */}
      <div className="pt-24 pb-16">
        {/* メインビジュアル */}
        <section className="container mx-auto px-4 pt-4 pb-12 md:pt-8 md:pb-16">
          <motion.h1 
            ref={titleRef}
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight max-w-4xl mb-8"
          >
            Track for
            <br />
            Personal Growth
          </motion.h1>
          <motion.h2
            ref={subtitleRef}
            initial={{ opacity: 0, y: 20 }}
            animate={subtitleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-xl md:text-2xl lg:text-3xl font-light text-gray-600 max-w-4xl mb-8"
          >
            Explore Yourself by Categorizing, Visualizing, and Analyzing
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={subtitleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto text-center bg-white p-6 rounded-lg shadow-lg"
          >
            <p className="mb-4">MyDBは、あなたの個人的な成長を追跡し、可視化するためのツールです。</p>
            <p className="mb-4">日々の感情や経験を記録し、時間の経過とともにあなたの変化を観察しましょう。</p>
            <p>自己分析を通じて、あなた自身をより深く理解し、成長への道筋を見つけることができます。</p>
          </motion.div>
        </section>

        {/* イメージセクション */}
        <section className="relative mt-0">
          <motion.div 
            ref={imageRef}
            initial={{ opacity: 0, y: 40 }}
            animate={imageInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative h-[250px] md:h-[500px]"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Videotogif-EJMvJ4t3TsM8MHRW4Om11p76duQfov.gif"
              alt="モチベーショントラッカーイメージ"
              fill
              className="object-cover"
            />
          </motion.div>
        </section>

        {/* モットーセクション */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            ref={mottoRef}
            initial={{ opacity: 0, y: 20 }}
            animate={mottoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl mx-auto text-center"
          >
            <blockquote className="text-xl md:text-2xl font-light italic">
              <p className="mb-4">「１個の道具のように自分を分析しなさい。</p>
              <p className="mb-4">自分自身に対して１００％率直でなければなりません。</p>
              <p className="mb-4">欠点を隠そうとせずに、正面から向かい合うのです。」</p>
            </blockquote>
            <p className="text-lg md:text-xl font-medium mt-4">- オードリー・ヘップバーン -</p>
          </motion.div>
        </section>


      </div>

      {/* 固定「無料で始める」ボタン */}
      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pb-4">
        <Link 
          href="/signup"
          className="px-8 py-3 text-white text-lg font-medium rounded-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          無料で始める
        </Link>
      </div>
    </main>
  )
}

