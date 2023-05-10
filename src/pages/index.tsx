import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";

import Link from "next/link";
import Image from "next/image";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingSpinner, { LoadingPage } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);

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

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className=" flex gap-2 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt="Image of the Author"
        className="rounded-full"
        width={56}
        height={56}
      />

      <div className="flex flex-col">
        <div className="flex  gap-1">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>

          <span className="font-thin">·</span>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>

        <span className="text-xl">{post.content}</span>
      </div>
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
