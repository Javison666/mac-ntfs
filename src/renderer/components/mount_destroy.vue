<template>
    <div id="wrapper">
        <h5>外接硬盘列表</h5>
        <ul>
            <li v-for="(item,index) in hddList" :key="index">
                <span>{{item[0]}}</span>
                <a href="#" @click.prevent="open(item[2])">打开</a>
                <a href="#" @click.prevent="crack(item)">mac下读写</a>
            </li>
        </ul>
        <button class="alt" @click="crack();">crack</button>
        <button class="alt" @click="test();">test</button>
    </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import { setTimeout } from "timers";
import Swal from "sweetalert2";

export default {
    name: "landing-page",
    components: { SystemInformation },
    data() {
        return {
            hddList: [],
            ntfsList: [],
            pwd: ""
        };
    },
    mounted() {
        this.getHddList();
        this.init();
    },
    methods: {
        async test() {
            let res = await this.$fs.read({
                path: "/etc/fstab"
            });
        },
        init() {
            setTimeout(() => {
                this.getHddList();
                this.init();
            }, 1000);
        },
        open(link) {
            this.$electron.shell.openExternal(link);
        },
        getHddList() {
            console.log(1);
            this.$exec.run({
                cmd: "mount",
                out: data => {
                    this.handleHddList(data);
                }
            });
        },
        handleHddList(data) {
            let res;
            let ntfsArr = [];
            let hddArr = [];
            res = data.split("\n");
            res.length = res.length - 1;
            res.forEach(item => {
                let h = item.split(" on ");
                h.push(h[1].split("(")[0]);
                if (h[1].indexOf("ntfs") > -1) {
                    ntfsArr.push(h);
                } else {
                    hddArr.push(h);
                }
            });
            this.ntfsList = ntfsArr;
            this.hddList = hddArr;
        },
        open(path) {
            this.$exec.run({
                cmd: `open ${path}`
            });
        },
        async crack(item) {
            let res=await this.$exec.info({
                cmd: `diskutil list`,
            })
            //  获取外接硬盘的列表
            res=res.split('\n\n').filter(item=>{
                return item && item.indexOf('external')>-1?true:false
            })
            // 处理外接硬盘的信息
            res.forEach(item=>{
                let one={}
                if(item.indexOf('Windows_NTFS')>-1){
                    one.isNtfs=true
                }else{
                    one.isNtfs=false
                }
                item=item.split('\n')
                console.log(item)
                let nameStartPos=item[3].indexOf('Windows_NTFS')+12
                let sizeStartPos=item[1].indexOf('SIZE')-3
                let idStartPos=item[1].indexOf('IDENTIFIER')-3
                one.name=item[3].slice(nameStartPos,sizeStartPos).trim()
                one.size=item[3].slice(sizeStartPos,idStartPos).trim()

                console.log(one)
            })
            return false;
            // const { value: password } = await Swal({
            //     title: "请输入你的管理员密码",
            //     input: "password",
            //     inputPlaceholder: "Enter your password",
            //     inputAttributes: {
            //         maxlength: 50,
            //         autocapitalize: "off",
            //         autocorrect: "off"
            //     }
            // });
            // if (password != null && password != "") {
            //     this.$exec.run({
            //         cmd: `echo ${password}|sudo -S diskutil unmount ${item[2].trim()}`,
            //         close: code => {
            //             console.log(
            //                 `echo ${password}|sudo -S diskutil mount -t ntfs -o rw,auto,nobrowse ${
            //                     item[0]
            //                 } ${item[2]}`
            //             );
            //             this.$exec.run({
            //                 cmd: `echo ${password}|sudo -S mkdir ${item[2]}`,
            //                 close: code => {
            //                     console.log('文件夹创建成功')
            //                     this.$exec.run({
            //                         cmd: `echo ${password}|sudo -S diskutil mount -t ntfs -o rw,auto,nobrowse ${
            //                             item[0]
            //                         } ${item[2]}`,
            //                         err:(data)=>{
            //                             console.log(data)
            //                         },
            //                         close:(code)=>{
            //                             console.log('end')
            //                         }
            //                     });
            //                 }
            //             });
            //         }
            //     });
            // }
        }
    }
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

button {
    font-size: 0.8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
}

button.alt {
    color: #42b983;
    background-color: transparent;
}
</style>
