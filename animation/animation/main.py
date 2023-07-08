from manim import *
import sys
import os

def image_and_bounding_rectangle(path, text):
    img1 = ImageMobject(path)
    img1.scale(2)
    t = Tex(text)
    img1.add(t.scale(1.5).next_to(img1,UP))
    img1.shift(DOWN*0.5)
    rect = SurroundingRectangle(img1, color=BLUE, buff=0.4, corner_radius=0.2)
    g = Group(rect, img1)
    return g, rect, img1

def get_image(path):
    img1 = ImageMobject(path)
    img1.scale(1.5)
    img1.shift(DOWN*0.5)
    return img1

def create_obj_array_from_path(path_arg):

    def numeric_sort_key(filename):
        number = int(filename.split("_")[-1].split(".")[0])
        return number

    list_path = sorted(os.listdir(path_arg), key=numeric_sort_key)
    l_res = []
    for path_i in list_path:
        path = os.path.join(path_arg, path_i)
        im_path = path
        if len(path) > 1:
            text = path[1]
        sample = {}
        sample["img"] = ImageMobject(im_path).scale(2)
        sample["path"] = im_path
        img = ImageMobject(im_path)
        img.scale(2)
        if len(path) > 1:
            t = Tex(text)
            img.add(t.scale(1.5).next_to(img,UP))
        img.shift(DOWN*0.5)
        rect = SurroundingRectangle(img, color=BLUE, buff=0.4, corner_radius=0.2)
        sample["rect"] = rect
        sample["group"] = Group(rect, img)
        l_res.append(sample)
    return l_res

def create_obj_array(list_path):
    l_res = []
    for path in list_path:
        im_path = path[0]
        if len(path) > 1:
            text = path[1]
        sample = {}
        sample["img"] = ImageMobject(im_path).scale(2)
        sample["path"] = im_path
        img = ImageMobject(im_path)
        img.scale(2)
        if len(path) > 1:
            t = Tex(text)
            sample["text"] = t
            img.add(t.scale(1.5).next_to(img,UP))
        img.shift(DOWN*0.5)
        rect = SurroundingRectangle(img, color=BLUE, buff=0.4, corner_radius=0.2)
        sample["rect"] = rect
        sample["group"] = Group(rect, img)
        l_res.append(sample)
    return l_res

def create_obj_array_init(list_path):
    l_res = []
    for path in list_path:
        im_path = path[0]
        if len(path) > 1:
            text = path[1]
        sample = {}
        sample["img"] = ImageMobject(im_path).scale(2)
        sample["path"] = im_path
        img = ImageMobject(im_path)
        img.scale(5)
        if len(path) > 1:
            t = Tex(text)
            sample["text"] = t
            img.add(t.scale(1.5).next_to(img,UP))
        img.shift(DOWN*0.5)
        rect = SurroundingRectangle(img, color=BLUE, buff=0.4, corner_radius=0.2)
        sample["rect"] = rect
        sample["group"] = Group(rect, img)
        l_res.append(sample)
    return l_res


class SuperTemporal(Scene):
    def construct(self):

        uab = ImageMobject("assets/images/uab.png")
        cvc = ImageMobject("assets/images/cvc.png")

        uab = uab.scale(0.15).move_to(LEFT*5.25).shift(DOWN*3.6)
        cvc = cvc.scale(0.7).move_to(LEFT*-6.25).shift(DOWN*3.4)

        self.add(uab)
        self.add(cvc)

        list_output_5 = [
            ["assets/images/input/delta_cropped_1.png", "19-08-2017"],
            ["assets/images/input/delta_cropped_2.png", "23-09-2018"],
            ["assets/images/input/delta_cropped_3.png", "05-09-2019"],
            ["assets/images/input/delta_cropped_4.png", "22-09-2020"],
            ["assets/images/input/delta_cropped_5.png", "17-09-2021"],
        ]

        init_list = create_obj_array_init(list_output_5)

        g = VGroup(
            Tex("End-to-End Framework for Continuous", font_size=64),
            Tex("Space-Time Super-Resolution", font_size=64),
            Tex("on Remote Sensing data", font_size=64),
        )

        g2 = Tex("A Practical Approach: ", "Delta de l'Ebre", font_size=57)
        g2[0].set_color(BLUE)
        g2[1].set_color(GREEN)
        g2.move_to(DOWN*1.35)

        self.add(g.arrange(DOWN))
        self.wait(2)

        animations = [
            g.animate.shift(UP*0.40),
            FadeIn(g2[0]),
            FadeIn(g2[1]),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0.5))
        self.wait(2)

        animations = [
            FadeOut(g),
            FadeOut(g2[0]),
            g2[1].animate.shift(LEFT*7.8, UP*4.75)
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0))

        animations = [
            FadeIn(init_list[0]["group"]),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0.5))

        animations = [
            init_list[0]["group"].animate.scale(0.4).shift(LEFT*5),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0.5))

        inc = 5
        for sample in init_list[1:]:
            inc -= 2.5
            sample["group"].scale(0.4).shift(LEFT*inc)

        animations = [
            FadeIn(init_list[1]["group"]),
            FadeIn(init_list[2]["group"]),
            FadeIn(init_list[3]["group"]),
            FadeIn(init_list[4]["group"]),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0.5))

        self.wait(2)

        g = Group(init_list[0]["group"], init_list[1]["group"], init_list[2]["group"], init_list[3]["group"], init_list[4]["group"])

        text = VGroup(
            Tex("Researchers believe the Delta de l'Ebre will be one of Catalonia's", font_size=46),
            Tex("regions most affected by climate change in the 21st century", font_size=46),
            Tex("https://canviclimatic.gencat.cat/en/oficina/publicacions/estudi\_delta\_de\_lebre", font_size=36, fill_color=BLUE),
        )

        text = text.arrange(DOWN)

        text.shift(DOWN*1)

        animations = [
            g.animate.scale(0.8).shift(UP*2),
            FadeIn(text),
        ]


        self.play(AnimationGroup(*animations, lag_ratio=0.2))

        self.wait(3)

        self.play(FadeOut(text))

        sample = init_list[0]
        img_og = sample["img"]
        img_og.scale(0.8)
        img_og.shift(DOWN*1.5)

        rect_og = SurroundingRectangle(img_og, color=BLUE, buff=0.2, corner_radius=0, fill_opacity=0.2, stroke_width=0)

        animations = [
            FadeOut(init_list[1]["rect"]),
            FadeOut(init_list[2]["rect"]),
            FadeOut(init_list[3]["rect"]),
            FadeOut(init_list[4]["rect"]),
            FadeIn(rect_og),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0.5))

        self.play(FadeIn(img_og))

        self.wait(1)

        prev_img = img_og
        prev_lis = [prev_img]
        for i in range(1, len(init_list)):
            sample = init_list[i]
            init_list[i-1]["rect"].set_color(BLACK)
            img_og = sample["img"]
            img_og.scale(0.8)
            img_og.shift(DOWN*1.5)
            self.remove(prev_img)
            self.add(img_og)
            self.add(sample["rect"])
            self.wait(0.6)
            prev_img = img_og
            if i < len(init_list)-1:
                prev_lis.append(prev_img)


        for img in prev_lis:
            self.remove(img)

        animations = [
            FadeOut(init_list[-1]["rect"]),
            FadeOut(rect_og),
            FadeOut(prev_img),
        ]

        # We trained a modified version of LIIF[1] to perform continuous space-time super-resolution by adding the temporal dimension to the input.
        # The model is trained on 5 original samples of various regions of the world, and is able to generate infinite new samples in between them.

        self.play(AnimationGroup(*animations, lag_ratio=0))

        self.remove(prev_img)

        init_list[-1]["rect"].set_color(BLACK)

        animations = [
            init_list[0]["group"].animate.scale(0.6).shift(LEFT*2.22),
            init_list[1]["group"].animate.scale(0.6).shift(LEFT*1.72),
            init_list[2]["group"].animate.scale(0.6).shift(LEFT*1.25),
            init_list[3]["group"].animate.scale(0.6).shift(LEFT*0.75),
            init_list[4]["group"].animate.scale(0.6).shift(LEFT*0.27),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0))

        text_g1 = Tex("5 Original Samples", substrings_to_isolate="5", font_size=28).next_to(g, RIGHT*1.5)
        text_g1.set_color_by_tex("5", BLUE)

        rect_g1 = SurroundingRectangle(g, color=BLUE, buff=0.15, corner_radius=0.2)
        animations = [
            FadeIn(text_g1),
            FadeIn(rect_g1),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0.4))

        self.wait()

        animations = [
            FadeOut(rect_g1),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0))

        list_output_10 = [
            ["assets/images/output-10/delta_x2_0.png"],
            ["assets/images/output-10/delta_x2_1.png"],
            ["assets/images/output-10/delta_x2_2.png"],
            ["assets/images/output-10/delta_x2_3.png"],
            ["assets/images/output-10/delta_x2_4.png"],
            ["assets/images/output-10/delta_x2_5.png"],
            ["assets/images/output-10/delta_x2_6.png"],
            ["assets/images/output-10/delta_x2_7.png"],
            ["assets/images/output-10/delta_x2_8.png"],
        ]

        outlist_10 = create_obj_array(list_output_10)

        inc = 6.2
        g2 = Group()
        for sample in outlist_10:
            sample["rect"].set_color(BLACK)
            sample["group"].scale(0.2).shift(LEFT*inc, UP*0)
            inc -= 1.24
            g2.add(sample["group"])

        animations = [
            FadeIn(outlist_10[0]["group"], shift=DOWN*4),
            FadeIn(outlist_10[1]["group"], shift=DOWN*4),
            FadeIn(outlist_10[2]["group"], shift=DOWN*4),
            FadeIn(outlist_10[3]["group"], shift=DOWN*4),
            FadeIn(outlist_10[4]["group"], shift=DOWN*4),
            FadeIn(outlist_10[5]["group"], shift=DOWN*4),
            FadeIn(outlist_10[6]["group"], shift=DOWN*4),
            FadeIn(outlist_10[7]["group"], shift=DOWN*4),
            FadeIn(outlist_10[8]["group"], shift=DOWN*4),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0))

        self.wait()

        rect_g2 = SurroundingRectangle(g2, color=GREEN, buff=0.15, corner_radius=0.2)
        text_g2 = Tex("x2", " Generated (10$\sim$)", font_size=28).next_to(g2, RIGHT*1)
        text_g2.set_color_by_tex("x2", GREEN)
        animations = [
            FadeIn(text_g2),
            FadeIn(rect_g2),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0.4))

        self.wait()

        animations = [
            FadeOut(rect_g2),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0))

        self.wait()

        b = Brace(rect_g2, sharpness=1.0, color="#BBBBBB")

        rect_g1g2_1 = SurroundingRectangle(Group(outlist_10[0]["group"], init_list[0]["group"]), color=YELLOW, buff=0.05, corner_radius=0.2)
        rect_g1g2_2 = SurroundingRectangle(Group(outlist_10[2]["group"], init_list[1]["group"]), color=YELLOW, buff=0.05, corner_radius=0.2)
        rect_g1g2_3 = SurroundingRectangle(Group(outlist_10[4]["group"], init_list[2]["group"]), color=YELLOW, buff=0.05, corner_radius=0.2)
        rect_g1g2_4 = SurroundingRectangle(Group(outlist_10[6]["group"], init_list[3]["group"]), color=YELLOW, buff=0.05, corner_radius=0.2)
        rect_g1g2_5 = SurroundingRectangle(Group(outlist_10[8]["group"], init_list[4]["group"]), color=YELLOW, buff=0.05, corner_radius=0.2)

        animations = [
            FadeIn(rect_g1g2_1),
            FadeIn(rect_g1g2_2),
            FadeIn(rect_g1g2_3),
            FadeIn(rect_g1g2_4),
            FadeIn(rect_g1g2_5),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0))

        text_brace = VGroup(
            Tex("Our model is capable of generating an ", "infinite", font_size=46),
            Tex("number of temporal interpolations", font_size=46),
        ).arrange(DOWN).next_to(b, DOWN*0.5)
        text_brace[0].set_color_by_tex("infinite", YELLOW)

        animations = [
            FadeOut(rect_g1g2_1),
            FadeOut(rect_g1g2_2),
            FadeOut(rect_g1g2_3),
            FadeOut(rect_g1g2_4),
            FadeOut(rect_g1g2_5),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0))

        self.wait()

        animations = [
            FadeIn(b),
            FadeIn(rect_g2),
            FadeIn(text_brace),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0.25))

        self.wait(2)

        g2_all = Group(g2, rect_g2)
        new_text_2 = Tex("we can also use any ", "arbitrary spatial scale", ".", font_size=46)
        new_text_2.set_color_by_tex("arbitrary spatial scale", YELLOW)
        new_text_2.next_to(text_brace[1], DOWN, buff=0.25)  # Adjust the positioning as needed
        self.play(Write(new_text_2))
        self.wait()
        text_brace.add(new_text_2)

        animations = [
            g2_all.animate.scale(1.2).shift(RIGHT*1.2, UP*0.2),
            b.animate.scale(1.2).shift(RIGHT*1.2),
            text_brace.animate.shift(RIGHT*1.2),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0))


        self.wait(1.5)

        animations = [
            g2_all.animate.shift(RIGHT*-1.2, DOWN*0.2).scale(0.84),
            b.animate.scale(0.8).shift(RIGHT*-1.2),
            text_brace.animate.shift(RIGHT*-1.2),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0))

        self.wait(1)

        self.play(FadeOut(rect_g2), FadeOut(b), FadeOut(text_brace))


        outlist_50 = create_obj_array_from_path("assets/images/output-50/")

        t1 = init_list[0]["text"].copy()
        t2 = init_list[1]["text"].copy()
        t3 = init_list[2]["text"].copy()
        t4 = init_list[3]["text"].copy()
        t5 = init_list[4]["text"].copy()

        animations = [
            outlist_10[0]["group"].animate.shift(LEFT*-2.5),
            outlist_10[2]["group"].animate.shift(LEFT*-1),
            outlist_10[3]["group"].animate.shift(LEFT*1),
            outlist_10[4]["group"].animate.shift(LEFT*3),
            outlist_10[5]["group"].animate.shift(LEFT*4),
            outlist_10[6]["group"].animate.shift(LEFT*5),
            outlist_10[7]["group"].animate.shift(LEFT*6),
            outlist_10[8]["group"].animate.shift(LEFT*7),
            outlist_10[-1]["group"].animate.shift(LEFT*8),
            init_list[0]["group"].animate.scale(0.192).shift(LEFT*0.025),
            init_list[1]["group"].animate.scale(0.192).shift(LEFT*0.025),
            init_list[2]["group"].animate.scale(0.192),
            init_list[3]["group"].animate.scale(0.192),
            init_list[4]["group"].animate.scale(0.192).shift(LEFT*-0.025),
            t1.animate.scale(2).shift(UP*0.05),
            t2.animate.scale(2).shift(UP*0.05),
            t3.animate.scale(2).shift(UP*0.05),
            t4.animate.scale(2).shift(UP*0.05),
            t5.animate.scale(2).shift(UP*0.05),
        ]

        for i in range(len(outlist_10)):
            animations.append(outlist_10[i]["group"].animate.scale(0.192))

        g3 = Group()
        inc = 6.245
        for i in range(len(outlist_50)):
            outlist_50[i]["group"].scale(0.038).shift(LEFT*inc, DOWN*2.5)
            outlist_50[i]["rect"].set_color(BLACK)
            inc -= 0.208
            animations.append(FadeIn(outlist_50[i]["group"], shift=DOWN*4))
            g3.add(outlist_50[i]["group"])

        # outlist_50[-2]["rect"].set_z_index(100)
        # outlist_50[-2]["rect"].set_color(YELLOW)

        self.play(AnimationGroup(*animations, lag_ratio=0))

        text_g3 = Tex("x10", " Generated (50$\sim$)", font_size=28).next_to(g3, RIGHT*1.5)
        text_g3.set_color_by_tex("x10", RED)
        rect_g3 = SurroundingRectangle(g3, color=RED, buff=0.05, corner_radius=0.05)
        animations = [
            FadeIn(text_g3),
            FadeIn(rect_g3),
        ]
        self.play(AnimationGroup(*animations, lag_ratio=0.4))

        self.wait()

        rect_g1g2g3_1 = SurroundingRectangle(Group(outlist_50[0]["group"], init_list[0]["group"]), color=YELLOW, buff=0.05, corner_radius=0.01)
        rect_g1g2g3_2 = SurroundingRectangle(Group(outlist_50[12]["group"], init_list[1]["group"]), color=YELLOW, buff=0.05, corner_radius=0.01)
        rect_g1g2g3_3 = SurroundingRectangle(Group(outlist_50[24]["group"], init_list[2]["group"]), color=YELLOW, buff=0.05, corner_radius=0.01)
        rect_g1g2g3_4 = SurroundingRectangle(Group(outlist_50[36]["group"], init_list[3]["group"]), color=YELLOW, buff=0.05, corner_radius=0.01)
        rect_g1g2g3_5 = SurroundingRectangle(Group(outlist_50[-1]["group"], init_list[4]["group"]), color=YELLOW, buff=0.05, corner_radius=0.01)

        animations = [
            FadeIn(rect_g1g2g3_1),
            FadeIn(rect_g1g2g3_2),
            FadeIn(rect_g1g2g3_3),
            FadeIn(rect_g1g2g3_4),
            FadeIn(rect_g1g2g3_5),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0))

        self.wait()

        rect_g = SurroundingRectangle(g, color=BLUE, buff=0.05, corner_radius=0.05)
        rect_g2 = SurroundingRectangle(g2, color=GREEN, buff=0.05, corner_radius=0.05)

        g_rect = Group(g, rect_g)
        g2_rect = Group(g2, rect_g2)
        g3_rect = Group(g3, rect_g3)

        animations = [
            FadeOut(rect_g1g2g3_1),
            FadeOut(rect_g1g2g3_2),
            FadeOut(rect_g1g2g3_3),
            FadeOut(rect_g1g2g3_4),
            FadeOut(rect_g1g2g3_5),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0))

        animations = [
            FadeIn(rect_g2),
            FadeIn(rect_g),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0.5))

        animations = [
            FadeOut(rect_g3),
            FadeOut(rect_g2),
            FadeOut(rect_g),
            FadeOut(text_g3),
            FadeOut(text_g2),
            FadeOut(text_g1),
            g2.animate.shift(UP*2.1),
            g3.animate.shift(UP*4.05),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0))

        g_total = Group(g, g2, g3, t1, t2, t3, t4, t5)

        animations = [
            g_total.animate.shift(LEFT*-1.25),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0))


        square_original = SurroundingRectangle(g2[0][-1], color=BLUE, buff=0.15, corner_radius=0.01, fill_opacity=0.2, stroke_width=0).scale(6.5).shift(DOWN*3.25, LEFT*-1.5)
        square_temporal_10 = SurroundingRectangle(g2[0][-1], color=GREEN, buff=0.15, corner_radius=0.01, fill_opacity=0.2, stroke_width=0).scale(6.5).next_to(square_original, RIGHT*1)
        square_temporal_50 = SurroundingRectangle(g2[0][-1], color=RED, buff=0.15, corner_radius=0.01, fill_opacity=0.2, stroke_width=0).scale(6.5).next_to(square_temporal_10, RIGHT*1)

        text_original = Tex("Original", font_size=48).next_to(square_original, UP*1.25)
        text_temporal_10 = VGroup(
            Tex("Temporal LIIF", font_size=32).shift(DOWN*2),
            Tex("x2 Spatial x2 Temporal", font_size=28),
        ).arrange(DOWN).next_to(square_temporal_10, UP*0.5)

        text_temporal_50 = VGroup(
            Tex("Temporal LIIF", font_size=32).shift(DOWN*2),
            Tex("x2 Spatial x10 Temporal", font_size=28),
        ).arrange(DOWN).next_to(square_temporal_50, UP*0.5)

        animations = [
            FadeIn(square_original),
            Write(text_original),
            FadeIn(square_temporal_10),
            Write(text_temporal_10),
            FadeIn(square_temporal_50),
            Write(text_temporal_50),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0.5))

        text_fps_original = Tex("FPS: 0.8$\sim$", font_size=32).next_to(square_original, DOWN*1)
        text_fps_10 = Tex("FPS: 1.6$\sim$", font_size=32).next_to(square_temporal_10, DOWN*1)
        text_fps_50 = Tex("FPS: 12.0$\sim$", font_size=32).next_to(square_temporal_50, DOWN*1)

        animations = [
            FadeIn(text_fps_original),
            FadeIn(text_fps_10),
            FadeIn(text_fps_50),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0.5))

        self.wait(2)

        prev_rect_50 = None
        prev_rect_10 = None
        prev_rect_in = None

        prev_img_50 = None
        prev_img_10 = None
        prev_img_in = None
        for i in range(len(outlist_50)):
            if prev_rect_50 is not None:
                prev_rect_50.set_opacity(0)
                self.remove(prev_img_50)

            if i == 0 or i == 6 or i == 12 or i == 18 or i == 24 or i == 30 or i == 36 or i == 42 or i == 48:
                if prev_rect_10 is not None:
                    prev_rect_10.set_opacity(0)
                    self.remove(prev_img_10)
                prev_img_10 = outlist_10[i//6]["img"]
                prev_img_10.match_width(square_temporal_10)
                prev_img_10.scale((prev_img_10.get_width() / square_temporal_10.get_width()) - 0.1)
                prev_img_10.move_to(square_temporal_10.get_center())
                self.add(prev_img_10)
                outlist_10[i//6]["rect"].set_color(GREEN)
                outlist_10[i//6]["rect"].set_stroke(GREEN, width=2)
                outlist_10[i//6]["rect"].set_z_index(100)
                prev_rect_10 = outlist_10[i//6]["rect"]

            if i == 0 or i == 12 or i == 24 or i == 36 or i == 48:
                if prev_rect_in is not None:
                    prev_rect_in.set_opacity(0)
                    self.remove(prev_img_in)
                prev_img_in = init_list[i//12]["img"]
                prev_img_in.match_width(square_original)
                prev_img_in.scale((prev_img_in.get_width() / square_original.get_width()) - 0.1)
                prev_img_in.move_to(square_original.get_center())
                self.add(prev_img_in)
                init_list[i//12]["rect"].set_color(BLUE)
                init_list[i//12]["rect"].set_stroke(BLUE, width=2)
                init_list[i//12]["rect"].set_z_index(100)
                prev_rect_in = init_list[i//12]["rect"]

            prev_rect_50 = outlist_50[i]["rect"]
            prev_img_50 = outlist_50[i]["img"]
            prev_img_50.match_width(square_temporal_50)
            prev_img_50.scale((prev_img_50.get_width() / square_temporal_50.get_width()) - 0.1)
            prev_img_50.move_to(square_temporal_50.get_center())
            self.add(prev_img_50)
            outlist_50[i]["rect"].set_color(RED)
            outlist_50[i]["rect"].set_stroke(RED, width=2)
            outlist_50[i]["rect"].set_z_index(100)
            self.wait(0.1)

        self.wait()

        prev_rect_in.set_opacity(0)
        prev_rect_10.set_opacity(0)
        prev_rect_50.set_opacity(0)
        # self.remove(prev_img_50)
        # self.remove(prev_img_10)
        # self.remove(prev_img_in)
        # FadeOut(prev_rect_50),
        # FadeOut(prev_rect_10),
        # FadeOut(prev_rect_in),

        self.wait(0.5)

        animations = [

            FadeOut(prev_rect_50),
            FadeOut(prev_rect_10),
            FadeOut(prev_rect_in),

            FadeOut(prev_img_50),
            FadeOut(prev_img_10),
            FadeOut(prev_img_in),

            FadeOut(square_original),
            FadeOut(text_original),
            FadeOut(text_fps_original),

            FadeOut(square_temporal_10),
            FadeOut(text_temporal_10),
            FadeOut(text_fps_10),

            FadeOut(square_temporal_50),
            FadeOut(text_temporal_50),
            FadeOut(text_fps_50),

            FadeOut(t1, t2, t3, t4, t5),
        ]

        self.play(AnimationGroup(*animations, lag_ratio=0))

        animations = [

        ]

        for i in range(len(outlist_50)):
            animations.append(FadeOut(outlist_50[i]["group"]))

        for i in range(len(outlist_10)):
            animations.append(FadeOut(outlist_10[i]["group"]))

        for i in range(len(init_list)):
            animations.append(FadeOut(init_list[i]["group"]))

        self.play(AnimationGroup(*animations, lag_ratio=0))

        self.wait(2)

        vg = VGroup(
            Tex("Find out more at:", font_size=48),
            Tex("github.com/ggcr/Super-Temporal-LIIF", color=BLUE, font_size=32).next_to(Tex("Find out more at:"), DOWN*1)
        ).arrange(DOWN*1.5)

        self.play(FadeIn(vg))

        self.wait(3)

        self.play(FadeOut(vg))
