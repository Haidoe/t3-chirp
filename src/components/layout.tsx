import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex min-h-screen justify-center">
      <div className=" flex w-full flex-col  border-x border-s-slate-400 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};
