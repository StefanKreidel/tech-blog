---
layout: post
title:  "Copying EXIF Metadata (Mac and Linux)"
description: "Recover original medatada after transcoding or editing photos or videos."
date:   2023-09-22 20:10:00 +0100
author: stefan
image:  'https://i.imgur.com/gY3kqu2.jpg'
featured: false
tags:   [Media, EXIF, Bash]
tags_color: '#9485a2'
---

Transcoding photos or videos is a great way of reducing overall file sizes or optimizing them for easier (and this usually means faster) workflows in programs like Final Cut, Premiere Pro or Davinci Resolve. All of these programs nowadays have easy mechanisms for creating proxy files which are less taxing on your hardware. But that only works within these programs. If you later on want to export the files in such a format, you most likely came across one particular problem: **The original medatada** (like creation time) **is lost**.

There are three ways of "fixing" this:
- You do **not optimize** (aka transcode) you media files and always keep the original ones.
- You go on a **search for programs** which allow you to keep the original metadata when transcoding. Let me know if you find any that do not suck :)
- You transcode the files and afterwards **copy over the old metadata**.

## 1. What is Metadata?

According to [Wikipedia](https://en.wikipedia.org/wiki/Metadata), metadata

> is data that provides information about other data, but [is] not the content of the data itself.

It enriches the actual data with meta information about its' content. This can be anything from a files name, size and creation date all the way to GPS coordinates of a photo, color profile of a video or compression rate of a ZIP file.

Now, as the metadata is technically not part of the actual file, no standard has been established on how to handle it when transcoding a file. In many cases you would argue that you want to retain the original metadata as you did not edit but rather transformed the original file. But some metadata would no longer be correct after transcoding. Maybe the color profile of a file changed. Maybe the bitrate is different. So programs would have to intelligently decide which parts of the original data to keep and which to drop or edit.

## 2. The Problem with Photos and Videos

Popular free software like [Handbrake](https://handbrake.fr) (video transcoding), [DaVinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve) (video editing and transcoding) or [Gimp](https://www.gimp.org) (photo editing and transcoding) **do not keep a file's creation date or GPS location**.

On the one hand, this might seem correct. Metadata describes the file itself and the newly transcoded file has a new creation date and of course no GPS information as it was not "taken" but generated.

On the other hand, this makes not semantic sense. The original creation date and GPS information is what you want. Even though the file was transcoded, you still want to know where and when a photo or video was taken. Unfortunately, I could not find a simple solution to do this with any non-sketchy program, so I wrote my own script.

## 3. Copy Metadata over

All photo or video files these days have their metadata stored in a format called [EXIF](https://en.wikipedia.org/wiki/Exif). This means that with all current operating systems, there are two sets of metadata fot those files: EXIF and filesystem metadata.

No real standard has been established on what metadata operating system or programs use for the file creation date. Most of the times it is EXIF, sometimes it is the one from the filesystem (check the [limitations section](#limitations), if that is your case). For everything else, EXIF seems to be the de-facto standard.

This means all you have to do to keep your original metadata after transcoding a file is to copy the EXIF metadata over to the new file. This can easily be done with the [ExifTool](https://exiftool.org), which is available for Mac, Windows and Linux.

## 4. What about Batch Processing?

ExifTool is command line based and copying over metadata is straight forward:

```bash
exiftool -overwrite_original -extractEmbedded -TagsFromFile "/src.file" -All:All "/dest.file"
```

But doing so for hundreds of files is very tedious, so lets **batch process** that. If you are on Mac or Linux, then the following instructions are for you. If you are on **Windows**, watch out for my **next blog post** in the next weeks.

### Meet the Acript

1. As mentioned before, `ExifTool` is a prerequisite for this script to work. So go ahead and follow their [install instructions](https://exiftool.org/install.html).
2. Clone the git repository to my [bash script collection](https://github.com/StefanKreidel/bash-magic/tree/main) or download just the [metadata.sh script](https://github.com/StefanKreidel/bash-magic/blob/main/metacp/metacp.sh) directly.
3. Make the bash file executable:
```bash
chmod +x ./metacp.sh
```
4. Optionally: create an executable symlink:
```bash
sudo ln -s "/path/to/metacp.sh" "/path/to/symlink"
# full example; assumes you are already in the shell file's location
sudo ln -s "$(pwd)/metacp.sh" "/usr/local/bin/metacp"
```
5. Use the script:
```bash
# shell file directly
./metacp.sh --source "/the/media/source/folder" --destination "/the/media/destination/folder"
# symlink
metacp --source "/the/media/source/folder" --destination "/the/media/destination/folder"
```

The source folder is where the original files with the correct metadata are located. The destination folder is where your transcoded files are located. This script loops over all files found in the `--destination` folder, searches for the "same" files in the `--source` folder and simply copies the original EXIF metadata over.

The **filenames are compared case-insensitive** and the file extension (.jpg, .mp4, .mkv) are ignored in both cases. This means that:

- **FILE**.mp4 matches **file**.mp4
- file.**mkv** matches file.**MOV**
- file.**jpg** matches file.**m4a** --> be careful!
- but **file**.mp4 does not match **file_01**.mp4

### Limitations

1. For ease of use, I chose to copy over all the metadata from the original file. This might not be what you want to do. Maybe you want to keep some of the metadata from the transcoded file. In that case you would have to adjust the `exiftool` command in my script to only copy over some parts of the original files' metadata.
2. Some programs (like DaVinci Resolve) do **use the filesystem creation date** for sorting files. This means that all files appear in the order they were imported to you machine and not in the order they were taken.
If you need a solution for that, feel free to check out the `retouch` script in my [git repository](https://github.com/StefanKreidel/bash-magic/tree/main) or wait for an **upcoming blog post** on that topic in the next weeks.
