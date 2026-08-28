const Hero = () => {
  return (
    <div className="relative h-[75vh] w-full border-b bg-muted">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 p-8 text-center sm:p-32">
        <span>
          <h1 className="text-3xl leading-10 font-normal text-foreground">
            Store
          </h1>
          <h2 className="text-3xl leading-10 font-normal text-muted-foreground">
            Shop the collection
          </h2>
        </span>
      </div>
    </div>
  )
}

export default Hero
