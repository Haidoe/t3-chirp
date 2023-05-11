import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";

import Image from "next/image";

import { api } from "~/utils/api";

import LoadingSpinner, { LoadingPage } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import PostView from "~/components/postview";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong!");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-2">
      <Image
        src={user.profileImageUrl}
        alt="User's Profile Image"
        className=" rounded-full"
        width={56}
        height={56}
      />

      <input
        className="grow bg-inherit outline-none"
        placeholder="Type some emojis!"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();

            if (input !== "") {
              mutate({
                content: input,
              });
            }
          }
        }}
        disabled={isPosting}
      />

      {input !== "" && (
        <button onClick={() => mutate({ content: input })} disabled={isPosting}>
          {isPosting ? (
            <div>
              <LoadingSpinner size={20} />
            </div>
          ) : (
            "Post"
          )}
        </button>
      )}
    </div>
  );
};

const Feed = () => {
  const { data: posts, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!posts) return <div> Something went wrong... </div>;

  return (
    <div>
      {posts?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const { isLoaded: userLoaded, isSignedIn } = useUser();

  //Start fetching ASAP --- this is react query
  api.posts.getAll.useQuery();

  if (!userLoaded) {
    return <LoadingPage />;
  }

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {isSignedIn ? <CreatePostWizard /> : <SignInButton />}
        </div>

        <div className="relative grow">
          <Feed />
        </div>
      </PageLayout>
    </>
  );
};

export default Home;
