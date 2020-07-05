import { upload as mini_upload } from "miniprogram-ci";
import createProject from "./project";
import { BaseObject } from "../types/index";
import Config from "./config";

function upload(config: Config, args: BaseObject) {
  let { project, upload } = config;
  const mini_project = createProject(project);
  mini_upload({
    project: mini_project,
    ...upload,
  })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

export default upload;
